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
    [InlineData(null, "Kowalski")]  
    [InlineData("Jan", null)]    
    [InlineData("", "Kowalski")]  
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
    [Fact]
    public async Task AddPersonToTreeAsync_DuplicateNameInSameTree_ReturnsDuplicateNameError()
    {
        // Arrange
        await using var context = InMemoryFamilyTreeContextFactory.Create();
        var tree = FamilyMemberTestDataFactory.CreateFamilyTree(id: 1, ownerId: 1);

        // First, add a person with this name
        var existingPersonDto = FamilyMemberTestDataFactory.CreateCreatePersonDto(
            firstName: "Jan",
            lastName: "Kowalski");
        var sut = new FamilyMemberServiceTestBuilder(context).Build();

        var (firstSuccess, _, _) = await sut.AddPersonToTreeAsync(tree.Id, tree.OwnerId, existingPersonDto);
        Assert.True(firstSuccess);

        // Now try to add another person with the EXACT same name in the SAME tree
        var duplicateDto = FamilyMemberTestDataFactory.CreateCreatePersonDto(
            firstName: "Jan",
            lastName: "Kowalski");

        // Act
        var (Success, Person, Error) = await sut.AddPersonToTreeAsync(tree.Id, tree.OwnerId, duplicateDto);

        // Assert
        Assert.False(Success, "Adding duplicate name should fail");
        Assert.Null(Person, "No person should be returned");
        Assert.NotNull(Error, "Error should be present");
        Assert.Equal(ServiceErrors.DuplicateName, Error, "Should be duplicate name error");

        // Verify only one person with this name exists in the tree
        var peopleInTree = await context.People
            .Include(p => p.TreeMembers)
            .Where(p => p.TreeMembers.Any(tm => tm.FamilyTreeId == tree.Id))
            .ToListAsync(TestContext.Current.CancellationToken);

        Assert.Single(peopleInTree, p => p.FirstName == "Jan" && p.LastName == "Kowalski");
    }

    [Fact]
    public async Task AddPersonToTreeAsync_SameNameDifferentTree_AllowsDuplicate()
    {
        // Arrange - Create TWO separate trees
        var (context, tree1) = await CreateTestSetupAsync(treeId: 1, ownerId: 1);
        var tree2 = FamilyMemberTestDataFactory.CreateFamilyTree(id: 2, ownerId: 2);
        context.FamilyTrees.Add(tree2);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var sut = CreateService(context);

        // Add "Jan Kowalski" to Tree 1
        var dto = FamilyMemberTestDataFactory.CreateCreatePersonDto(firstName: "Jan", lastName: "Kowalski");
        await sut.AddPersonToTreeAsync(treeId: 1, userId: 1, dto);

        // Act - Try to add "Jan Kowalski" to Tree 2 (different tree!)
        var (Success, Person, Error) = await sut.AddPersonToTreeAsync(treeId: 2, userId: 2, dto);

        // Assert - Should be allowed because it's a different tree
        Assert.True(Success, "Same name should be allowed in different trees");
        Assert.Null(Error);
        Assert.NotNull(Person);

        // Verify both trees have their own "Jan Kowalski"
        var peopleInTree1 = await context.People
            .Include(p => p.TreeMembers)
            .Where(p => p.TreeMembers.Any(tm => tm.FamilyTreeId == 1))
            .ToListAsync(TestContext.Current.CancellationToken);

        var peopleInTree2 = await context.People
            .Include(p => p.TreeMembers)
            .Where(p => p.TreeMembers.Any(tm => tm.FamilyTreeId == 2))
            .ToListAsync(TestContext.Current.CancellationToken);

        Assert.Equal(1, peopleInTree1.Count);
        Assert.Equal(1, peopleInTree2.Count);
    }


}