using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Services;
using FamilyTreeApp.Server.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;

namespace FamilyTreeApp.Server.Tests.Services;

public class FamilyTreeServiceTests
{
    private readonly Mock<UserManager<User>> _userManager;
    private readonly Mock<ILogger<FamilyTreeService>> _mockLogger;

    public FamilyTreeServiceTests()
    {
        _userManager = MockServiceFactory.CreateUserManager();
        _mockLogger = MockServiceFactory.CreateLogger<FamilyTreeService>();
    }

    [Fact]
    public async Task CreateTree_Success_ReturnTreeData()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = new FamilyTreeService(context, _userManager.Object, _mockLogger.Object);

        User testUser = TestDataSeeder.CreateTestUser(5, "Test User For Tree", "oneforallemail@gmail.com");
        
        // Add user to database so the service can find it
        context.Users.Add(testUser);
        await context.SaveChangesAsync();

        var treeDto = new CreateTreeDto
        {
            Name = "My Family Tree",
            Description = "Sample Test Description"
        };
        
        // Act
        var (success, familyTreeDto, error) = await service.CreateTreeAsync(testUser.Id, treeDto);

        // Assert
        Assert.True(success);
        Assert.NotNull(familyTreeDto);
        Assert.Null(error);
        Assert.Equal("My Family Tree", familyTreeDto.Name);
        Assert.Equal("Sample Test Description", familyTreeDto.Description);
        Assert.Equal("Test User For Tree", familyTreeDto.OwnerUsername);
        Assert.Equal(5, familyTreeDto.OwnerId);

        // Verify tree was added to database
        var savedTree = await context.FamilyTrees.FindAsync(familyTreeDto.Id);
        Assert.NotNull(savedTree);

    }


}
