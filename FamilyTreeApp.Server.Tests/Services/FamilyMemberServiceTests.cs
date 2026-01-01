using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace FamilyTreeApp.Server.Tests.Services;

public class FamilyMemberServiceTests
{
    private readonly Mock<IHtmlSanitizerService> _mockHtmlSanitizer;
    private readonly Mock<ILogger<FamilyMemberService>> _mockLogger;

    public FamilyMemberServiceTests()
    {
        _mockHtmlSanitizer = new Mock<IHtmlSanitizerService>();
        _mockLogger = new Mock<ILogger<FamilyMemberService>>();

        // Default sanitizer behavior - returns input as-is
        _mockHtmlSanitizer
            .Setup(x => x.Sanitize(It.IsAny<string>()))
            .Returns((string input) => input);
    }

    private FamilyTreeContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new FamilyTreeContext(options);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_Success_ReturnsPersonWithCorrectData()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        
        context.Users.Add(owner);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync();

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
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

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
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var otherUser = new User { Id = 2, UserName = "other", Email = "other@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        
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
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var collaborator = new User { Id = 2, UserName = "collab", Email = "collab@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        var treeCollaborator = new TreeCollaborator
        {
            FamilyTreeId = 1,
            UserId = 2,
            Permission = "Edit"
        };
        
        context.Users.AddRange(owner, collaborator);
        context.FamilyTrees.Add(tree);
        context.TreeCollaborators.Add(treeCollaborator);
        await context.SaveChangesAsync();

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
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var collaborator = new User { Id = 2, UserName = "collab", Email = "collab@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        var treeCollaborator = new TreeCollaborator
        {
            FamilyTreeId = 1,
            UserId = 2,
            Permission = "View"
        };
        
        context.Users.AddRange(owner, collaborator);
        context.FamilyTrees.Add(tree);
        context.TreeCollaborators.Add(treeCollaborator);
        await context.SaveChangesAsync();

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
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        
        context.Users.Add(owner);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync();

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe",
            BirthDate = new DateOnly(2000, 1, 1),
            DeathDate = new DateOnly(1990, 1, 1) // Death before birth!
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 1, dto);

        // Assert
        Assert.False(success);
        Assert.Null(person);
        Assert.Equal("Death date cannot be before birth date", error);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_WithBiography_SanitizesHtml()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        _mockHtmlSanitizer
            .Setup(x => x.Sanitize("<script>alert('xss')</script>"))
            .Returns("alert('xss')");

        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        
        context.Users.Add(owner);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync();

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe",
            Biography = "<script>alert('xss')</script>"
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 1, dto);

        // Assert
        Assert.True(success);
        Assert.NotNull(person);
        _mockHtmlSanitizer.Verify(x => x.Sanitize("<script>alert('xss')</script>"), Times.Once);
        Assert.Equal("alert('xss')", person.Biography);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_TrimsWhitespace_FromAllFields()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        
        context.Users.Add(owner);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync();

        var dto = new CreatePersonDto
        {
            FirstName = "  John  ",
            LastName = "  Doe  ",
            MiddleName = "  Michael  ",
            MaidenName = "  Smith  ",
            BirthPlace = "  New York  ",
            DeathPlace = "  Boston  ",
            Gender = "  Male  "
        };

        // Act
        var (success, person, error) = await service.AddPersonToTreeAsync(1, 1, dto);

        // Assert
        Assert.True(success);
        Assert.NotNull(person);
        Assert.Equal("John", person.FirstName);
        Assert.Equal("Doe", person.LastName);
        Assert.Equal("Michael", person.MiddleName);
        Assert.Equal("Smith", person.MaidenName);
        Assert.Equal("New York", person.BirthPlace);
        Assert.Equal("Boston", person.DeathPlace);
        Assert.Equal("Male", person.Gender);
    }

    [Fact]
    public async Task AddPersonToTreeAsync_EmptyBiography_SetsToNull()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        
        context.Users.Add(owner);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync();

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
        var context = GetInMemoryDbContext();
        var service = new FamilyMemberService(context, _mockHtmlSanitizer.Object, _mockLogger.Object);

        var owner = new User { Id = 1, UserName = "owner", Email = "owner@test.com" };
        var tree = new FamilyTree { Id = 1, Name = "Test Tree", OwnerId = 1, Owner = owner };
        
        context.Users.Add(owner);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync();

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