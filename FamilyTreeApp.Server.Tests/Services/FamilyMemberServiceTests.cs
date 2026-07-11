using FamilyTreeApp.Server.Constants;
using FamilyTreeApp.Server.Models.Enums;
using FamilyTreeApp.Server.Tests.TestHelpers;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace FamilyTreeApp.Server.Tests.Services;

public class FamilyMemberServiceTests
{
    [Theory]
    [InlineData("Jan", "Kowalski", Gender.Male)]
    [InlineData("Maria", "Nowak", Gender.Female)]
    public async Task AddPersonToTreeAsync_ValidInput_AddsPersonAndTreeMember(
        string firstName,
        string lastName,
        Gender gender)
    {
        // Arrange
        await using var context = InMemoryFamilyTreeContextFactory.Create();
        var treeId = 1;
        var ownerId = 10;
        var tree = FamilyMemberTestDataFactory.CreateFamilyTree(id: treeId, ownerId: ownerId);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var dto = FamilyMemberTestDataFactory.CreateCreatePersonDto(
            firstName: firstName,
            lastName: lastName,
            gender: gender);

        var builder = new FamilyMemberServiceTestBuilder(context);
        // Don't mock the factory - use the real one
        var sut = builder.Build();

        // Act
        var (Success, Person, Error) = await sut.AddPersonToTreeAsync(treeId: treeId, userId: ownerId, dto);

        // Assert
        Assert.True(Success);
        Assert.Null(Error);
        Assert.NotNull(Person);
        Assert.Equal(firstName, Person.FirstName);

        var savedPerson = await context.People.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Equal(firstName, savedPerson.FirstName);
        Assert.Equal(lastName, savedPerson.LastName);
        Assert.Equal(gender, savedPerson.Gender);

        var memberLink = await context.TreeMembers.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Equal(1, memberLink.FamilyTreeId);
        Assert.Equal(savedPerson.Id, memberLink.PersonId);
    }

    // --- ValidateCreatePersonDto ---

    [Theory]
    [InlineData(null, null)]
    [InlineData("", "")]
    [InlineData("  ", "  ")]
    public async Task AddPersonToTreeAsync_BothNamesEmpty_ReturnsNameValidationError(
        string? firstName, string? lastName)
    {
        await using var context = InMemoryFamilyTreeContextFactory.Create();
        var tree = FamilyMemberTestDataFactory.CreateFamilyTree(id: 1, ownerId: 1);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var dto = FamilyMemberTestDataFactory.CreateCreatePersonDto(firstName: firstName, lastName: lastName);
        var sut = new FamilyMemberServiceTestBuilder(context).Build();

        var (Success, Person, Error) = await sut.AddPersonToTreeAsync(treeId: 1, userId: 1, dto);

        Assert.False(Success);
        Assert.Null(Person);
        Assert.NotNull(Error);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_DeathBeforeBirth_ReturnsDeathBeforeBirthError()
    {
        await using var context = InMemoryFamilyTreeContextFactory.Create();
        var tree = FamilyMemberTestDataFactory.CreateFamilyTree(id: 1, ownerId: 1);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var dto = FamilyMemberTestDataFactory.CreateCreatePersonDto(
            birthDate: new DateOnly(2000, 1, 1),
            deathDate: new DateOnly(1999, 1, 1));
        var sut = new FamilyMemberServiceTestBuilder(context).Build();

        var (Success, Person, Error) = await sut.AddPersonToTreeAsync(treeId: 1, userId: 1, dto);

        Assert.False(Success);
        Assert.Null(Person);
        Assert.Equal(ServiceErrors.DeathBeforeBirth, Error);
    }

    // --- GetTreeForEditAsync ---

    [Fact]
    public async Task AddPersonToTreeAsync_TreeNotFound_ReturnsFamilyTreeNotFoundError()
    {
        await using var context = InMemoryFamilyTreeContextFactory.Create();
        var dto = FamilyMemberTestDataFactory.CreateCreatePersonDto();
        var sut = new FamilyMemberServiceTestBuilder(context).Build();

        var (Success, Person, Error) = await sut.AddPersonToTreeAsync(treeId: 99, userId: 1, dto);

        Assert.False(Success);
        Assert.Null(Person);
        Assert.Equal(ServiceErrors.FamilyTreeNotFound, Error);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_UserIsNotOwner_ReturnsNoEditPermissionError()
    {
        await using var context = InMemoryFamilyTreeContextFactory.Create();
        var tree = FamilyMemberTestDataFactory.CreateFamilyTree(id: 1, ownerId: 10);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var dto = FamilyMemberTestDataFactory.CreateCreatePersonDto();
        var sut = new FamilyMemberServiceTestBuilder(context).Build();

        var (Success, Person, Error) = await sut.AddPersonToTreeAsync(treeId: 1, userId: 99, dto);

        Assert.False(Success);
        Assert.Null(Person);
        Assert.Equal(ServiceErrors.NoEditPermission, Error);
    }

    // --- PersistPersonAndTreeMemberAsync ---

    [Fact]
    public async Task AddPersonToTreeAsync_ValidInput_PersistsBothPersonAndTreeMember()
    {
        await using var context = InMemoryFamilyTreeContextFactory.Create();
        var tree = FamilyMemberTestDataFactory.CreateFamilyTree(id: 1, ownerId: 1);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var dto = FamilyMemberTestDataFactory.CreateCreatePersonDto();
        var sut = new FamilyMemberServiceTestBuilder(context).Build();

        await sut.AddPersonToTreeAsync(treeId: 1, userId: 1, dto);

        Assert.Equal(1, await context.People.CountAsync(TestContext.Current.CancellationToken));
        Assert.Equal(1, await context.TreeMembers.CountAsync(TestContext.Current.CancellationToken));

        var link = await context.TreeMembers.SingleAsync(TestContext.Current.CancellationToken);
        var person = await context.People.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Equal(1, link.FamilyTreeId);
        Assert.Equal(person.Id, link.PersonId);
    }
}