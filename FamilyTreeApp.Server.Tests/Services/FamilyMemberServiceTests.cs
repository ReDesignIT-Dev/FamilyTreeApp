using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Models.Enums;
using FamilyTreeApp.Server.Tests.TestHelpers;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace FamilyTreeApp.Server.Tests.Services;

public class FamilyMemberServiceTests
{
    [Fact]
    public async Task AddPersonToTreeAsync_ValidInput_AddsPersonAndTreeMember()
    {
        // Arrange
        await using var context = InMemoryFamilyTreeContextFactory.Create();

        var tree = FamilyMemberTestDataFactory.CreateFamilyTree(id: 1, ownerId: 10);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var dto = FamilyMemberTestDataFactory.CreateCreatePersonDto(
            firstName: "Jan",
            lastName: "Kowalski",
            gender: Gender.Male);

        var createdPerson = FamilyMemberTestDataFactory.CreatePersonEntity(
            firstName: "Jan",
            lastName: "Kowalski",
            gender: Gender.Male);

        var builder = new FamilyMemberServiceTestBuilder(context);
        builder.PersonFactoryMock
            .Setup(x => x.Create(It.Is<CreatePersonDto>(d => ReferenceEquals(d, dto) && d.Gender == Gender.Male)))
            .Returns(createdPerson);

        var sut = builder.Build();

        // Act
        var (Success, Person, Error) = await sut.AddPersonToTreeAsync(treeId: 1, userId: 10, dto);

        // Assert
        Assert.True(Success);
        Assert.Null(Error);
        Assert.NotNull(Person);

        builder.PersonFactoryMock.Verify(x => x.Create(It.IsAny<CreatePersonDto>()), Times.Once);

        var savedPerson = await context.People.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Equal("Jan", savedPerson.FirstName);
        Assert.Equal("Kowalski", savedPerson.LastName);
        Assert.Equal(Gender.Male, savedPerson.Gender);

        var memberLink = await context.TreeMembers.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Equal(1, memberLink.FamilyTreeId);
        Assert.Equal(savedPerson.Id, memberLink.PersonId);
    }
}