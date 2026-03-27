using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Factories;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Services;
using FamilyTreeApp.Server.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace FamilyTreeApp.Server.Tests.Services;

public class FamilyMemberServiceTests
{
    private readonly Mock<IHtmlSanitizerService> _mockHtmlSanitizer;
    private readonly Mock<ILogger<FamilyMemberService>> _mockLogger;
    private readonly Mock<IPersonFactory> _mockPersonFactory; // for permission/error tests
    private readonly IPersonFactory _realPersonFactory;       // for data-asserting tests

    public FamilyMemberServiceTests()
    {
        _mockHtmlSanitizer = MockServiceFactory.CreateHtmlSanitizer();
        _mockLogger = MockServiceFactory.CreateLogger<FamilyMemberService>();
        _mockPersonFactory = MockServiceFactory.CreatePersonFactory();
        _realPersonFactory = new PersonFactory(_mockHtmlSanitizer.Object); // real factory
    }

    // Tests that check PERSON DATA → use real factory
    [Fact]
    public async Task AddPersonToTreeAsync_Success_ReturnsPersonWithCorrectData()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyMemberService(
            context, _mockHtmlSanitizer.Object, _mockLogger.Object, _realPersonFactory);

        var (owner, tree) = await TestDataSeeder.SeedBasicScenarioAsync(context);

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe",
            MiddleName = "Michael",
            BirthDate = new DateOnly(1990, 1, 1),
            BirthPlace = "New York",
            Gender = "Male"
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 1, dto);

        // Assert
        Assert.True(success);
        Assert.NotNull(person);
        Assert.Null(error);
        Assert.Equal("John", person.FirstName);
        Assert.Equal("Doe", person.LastName);
        Assert.Equal("Michael", person.MiddleName);
        Assert.Equal(new DateOnly(1990, 1, 1), person.BirthDate);
        Assert.Equal("New York", person.BirthPlace);
        Assert.Equal("Male", person.Gender);

        // Verify person was added to database
        var savedPerson = await context.People.FindAsync(person.Id);
        Assert.NotNull(savedPerson);

        // Verify person was added to tree
        var treeMember = await context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == 1 && tm.PersonId == person.Id);
        Assert.NotNull(treeMember);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_TreeNotFound_ReturnsError()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyMemberService(
            context, _mockHtmlSanitizer.Object, _mockLogger.Object, _mockPersonFactory.Object);

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(999, 1, dto);

        // Assert
        Assert.False(success);
        Assert.Null(person);
        Assert.Equal("Family tree not found", error);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_UserNotOwner_ReturnsError()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyMemberService(
            context, _mockHtmlSanitizer.Object, _mockLogger.Object, _mockPersonFactory.Object);

        var owner = TestDataSeeder.CreateTestUser(1, "owner", "owner@test.com");
        var otherUser = TestDataSeeder.CreateTestUser(2, "other", "other@test.com");
        var tree = TestDataSeeder.CreateTestFamilyTree(1, "Test Tree", 1, owner);

        context.Users.AddRange(owner, otherUser);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync();

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 2, dto);

        // Assert
        Assert.False(success);
        Assert.Null(person);
        Assert.Equal("You don't have permission to edit this tree", error);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_CollaboratorWithEditPermission_Success()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyMemberService(
            context, _mockHtmlSanitizer.Object, _mockLogger.Object, _mockPersonFactory.Object);

        var (owner, collaborator, tree, collaboration) =
            await TestDataSeeder.SeedCollaboratorScenarioAsync(context, "Edit");

        var dto = new CreatePersonDto
        {
            FirstName = "Jane",
            LastName = "Smith"
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 2, dto);

        // Assert
        Assert.True(success);
        Assert.NotNull(person);
        Assert.Null(error);
        Assert.Equal("Jane", person.FirstName);
        Assert.Equal("Smith", person.LastName);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_CollaboratorWithViewPermission_ReturnsError()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyMemberService(
            context, _mockHtmlSanitizer.Object, _mockLogger.Object, _mockPersonFactory.Object);

        var (owner, collaborator, tree, collaboration) =
            await TestDataSeeder.SeedCollaboratorScenarioAsync(context, "View");

        var dto = new CreatePersonDto
        {
            FirstName = "Jane",
            LastName = "Smith"
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 2, dto);

        // Assert
        Assert.False(success);
        Assert.Null(person);
        Assert.Equal("You don't have permission to edit this tree", error);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_DeathDateBeforeBirthDate_ReturnsError()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyMemberService(
            context, _mockHtmlSanitizer.Object, _mockLogger.Object, _mockPersonFactory.Object);

        var (owner, tree) = await TestDataSeeder.SeedBasicScenarioAsync(context);

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe",
            BirthDate = new DateOnly(2000, 1, 1),
            DeathDate = new DateOnly(1990, 1, 1) // Death before birth!
        };
        Console.WriteLine("DTO BirthDate: " + dto.BirthDate);
        Console.WriteLine("DTO DeathDate: " + dto.DeathDate);
        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 1, dto);

        // Assert
        Assert.False(success);
        Assert.Null(person);
        Assert.Equal("Death date cannot be before birth date", error);
    }


    [Fact]
    public async Task AddPersonToTreeAsync_EmptyBiography_SetsToNull()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyMemberService(
            context, _mockHtmlSanitizer.Object, _mockLogger.Object, _mockPersonFactory.Object);

        var (owner, tree) = await TestDataSeeder.SeedBasicScenarioAsync(context);

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe",
            Biography = "   " // Only whitespace
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 1, dto);

        // Assert
        Assert.True(success);
        Assert.NotNull(person);
        Assert.Null(person.Biography);
        _mockHtmlSanitizer.Verify(x => x.Sanitize(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_LogsInformation_OnSuccess()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyMemberService(
            context, _mockHtmlSanitizer.Object, _mockLogger.Object, _mockPersonFactory.Object);

        var (owner, tree) = await TestDataSeeder.SeedBasicScenarioAsync(context);

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 1, dto);

        // Assert
        Assert.True(success);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("added person")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}