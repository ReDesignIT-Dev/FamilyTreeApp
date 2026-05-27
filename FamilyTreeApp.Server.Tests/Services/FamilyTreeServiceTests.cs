using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Services;
using FamilyTreeApp.Server.Tests.Helpers;
using Microsoft.Extensions.Logging;
using Moq;

namespace FamilyTreeApp.Server.Tests.Services;

public class FamilyTreeServiceTests
{
    private readonly Mock<Microsoft.AspNetCore.Identity.UserManager<FamilyTreeApp.Server.Models.User>> _userManager;
    private readonly Mock<ILogger<FamilyTreeService>> _mockLogger;

    public FamilyTreeServiceTests()
    {
        _userManager = MockServiceFactory.CreateUserManager();
        _mockLogger = MockServiceFactory.CreateLogger<FamilyTreeService>();
    }

    [Fact]
    public async Task CreateDefaultTreeAsync_Success_CreatesTreeInDatabase()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyTreeService(context, _userManager.Object, _mockLogger.Object);

        var user = TestDataSeeder.CreateTestUser(1, "Stefan", "Kowalski");
        context.Users.Add(user);
        await context.SaveChangesAsync();
        var dto = TestDataSeeder.CreateRegisterDtoFromUser(user);

        // Act
        await service.CreateDefaultTreeAsync(user.Id, dto);

        // Assert
        var tree = context.FamilyTrees.FirstOrDefault(t => t.OwnerId == 1);
        Assert.NotNull(tree);
        Assert.Equal("Stefan Kowalski's Family Tree", tree.Name);
        Assert.Equal(1, tree.OwnerId);
    }

    [Fact]
    public async Task GetUserTreeAsync_Success_ReturnsTree()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyTreeService(context, _userManager.Object, _mockLogger.Object);

        var (owner, tree) = await TestDataSeeder.SeedBasicScenarioAsync(context);

        // Act
        var (success, treeDto, error) = await service.GetUserTreeAsync(owner.Id);

        // Assert
        Assert.True(success);
        Assert.NotNull(treeDto);
        Assert.Null(error);
        Assert.Equal("Test Tree", treeDto.Name);
        Assert.Equal(tree.Id, treeDto.Id);
    }

    [Fact]
    public async Task GetUserTreeAsync_NoTree_ReturnsError()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyTreeService(context, _userManager.Object, _mockLogger.Object);

        // Act
        var (success, treeDto, error) = await service.GetUserTreeAsync(999);

        // Assert
        Assert.False(success);
        Assert.Null(treeDto);
        Assert.Equal("Family tree not found", error);
    }

    [Fact]
    public async Task UpdateTreeAsync_Success_UpdatesTreeData()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyTreeService(context, _userManager.Object, _mockLogger.Object);

        var (owner, tree) = await TestDataSeeder.SeedBasicScenarioAsync(context);

        var dto = new UpdateTreeDto
        {
            Name = "Updated Tree Name",
            Description = "Updated description"
        };

        // Act
        var (success, treeDto, error) = await service.UpdateTreeAsync(owner.Id, dto);

        // Assert
        Assert.True(success);
        Assert.NotNull(treeDto);
        Assert.Null(error);
        Assert.Equal("Updated Tree Name", treeDto.Name);
        Assert.Equal("Updated description", treeDto.Description);
        Assert.NotNull(treeDto.UpdatedAt);
    }

    [Fact]
    public async Task UpdateTreeAsync_NoTree_ReturnsError()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyTreeService(context, _userManager.Object, _mockLogger.Object);

        var dto = new UpdateTreeDto
        {
            Name = "Updated Name",
            Description = "Updated description"
        };

        // Act
        var (success, treeDto, error) = await service.UpdateTreeAsync(999, dto);

        // Assert
        Assert.False(success);
        Assert.Null(treeDto);
        Assert.Equal("Family tree not found", error);
    }
}
