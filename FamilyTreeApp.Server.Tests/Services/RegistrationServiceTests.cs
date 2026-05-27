using FamilyTreeApp.Server.Dtos.User;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Services;
using FamilyTreeApp.Server.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;

namespace FamilyTreeApp.Server.Tests.Services;

public class RegistrationServiceTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<IFamilyTreeService> _mockFamilyTreeService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<UserManager<User>> _mockUserManager;
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly Mock<ILogger<RegistrationService>> _mockLogger;

    public RegistrationServiceTests()
    {
        _mockUserService = new Mock<IUserService>();
        _mockFamilyTreeService = new Mock<IFamilyTreeService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockUserManager = MockServiceFactory.CreateUserManager();
        _mockConfig = new Mock<IConfiguration>();
        _mockLogger = MockServiceFactory.CreateLogger<RegistrationService>();
    }

    private RegistrationService CreateService(FamilyTreeApp.Server.Data.FamilyTreeContext context)
    {
        return new RegistrationService(
            _mockUserService.Object,
            _mockFamilyTreeService.Object,
            _mockEmailService.Object,
            _mockUserManager.Object,
            _mockConfig.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task RegisterAsync_Success_CreatesDefaultTreeForNewUser()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = CreateService(context);

        var dto = new RegisterDto
        {
            FirstName = "FirstName",
            LastName = "LastName",
            Email = "newuser@example.com",
            Password = "Password123!",
            PasswordConfirm = "Password123!",
            RecaptchaToken = "token"
        };

        var registeredUser = TestDataSeeder.CreateTestUser(1, "newuser", "newuser@example.com");

        _mockUserService
            .Setup(s => s.RegisterAsync(dto))
            .ReturnsAsync(new UserDto { Id = 1, Username = "newuser" });

        _mockUserManager
            .Setup(m => m.FindByEmailAsync(dto.Email))
            .ReturnsAsync(registeredUser);

        _mockUserManager
            .Setup(m => m.GenerateEmailConfirmationTokenAsync(registeredUser))
            .ReturnsAsync("email-confirmation-token");

        _mockConfig.Setup(c => c["Frontend:BaseUrl"]).Returns("https://localhost:3000");

        _mockEmailService
            .Setup(e => e.GetActivationEmailBody(It.IsAny<string>(), It.IsAny<string>()))
            .Returns("email body");

        _mockEmailService
            .Setup(e => e.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        _mockFamilyTreeService
            .Setup(s => s.CreateDefaultTreeAsync(It.IsAny<int>(), It.IsAny<RegisterDto>()))
            .Returns(Task.CompletedTask);

        // Act
        var (success, error) = await service.RegisterAsync(dto);

        // Assert
        Assert.True(success);
        Assert.Null(error);

        _mockFamilyTreeService.Verify(
            s => s.CreateDefaultTreeAsync(registeredUser.Id, dto),
            Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_UserServiceFails_DoesNotCreateTree()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext();
        var service = CreateService(context);

        var dto = new RegisterDto
        {
            FirstName = "FirstName",
            LastName = "LastName",
            Email = "existing@example.com",
            Password = "Password123!",
            PasswordConfirm = "Password123!",
            RecaptchaToken = "token"
        };

        _mockUserService
            .Setup(s => s.RegisterAsync(dto))
            .ReturnsAsync((UserDto?)null); // registration failed (e.g. duplicate email)

        // Act
        var (success, error) = await service.RegisterAsync(dto);

        // Assert
        Assert.False(success);
        Assert.Equal("Username or email is already taken.", error);

        _mockFamilyTreeService.Verify(
            s => s.CreateDefaultTreeAsync(It.IsAny<int>(), It.IsAny<RegisterDto>()),
            Times.Never);
    }
}