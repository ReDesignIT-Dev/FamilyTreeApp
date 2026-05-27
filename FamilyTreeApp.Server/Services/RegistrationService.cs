using FamilyTreeApp.Server.Dtos.User;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using Microsoft.AspNetCore.Identity;
using System.Net;

namespace FamilyTreeApp.Server.Services;

public class RegistrationService : IRegistrationService
{
    private readonly IUserService _userService;
    private readonly IFamilyTreeService _familyTreeService;
    private readonly IEmailService _emailService;
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _config;
    private readonly ILogger<RegistrationService> _logger;

    public RegistrationService(
        IUserService userService,
        IFamilyTreeService familyTreeService,
        IEmailService emailService,
        UserManager<User> userManager,
        IConfiguration config,
        ILogger<RegistrationService> logger)
    {
        _userService = userService;
        _familyTreeService = familyTreeService;
        _emailService = emailService;
        _userManager = userManager;
        _config = config;
        _logger = logger;
    }

    public async Task<(bool Success, string? Error)> RegisterAsync(RegisterDto dto)
    {
        try
        {
            var userDto = await _userService.RegisterAsync(dto);
            if (userDto == null)
                return (false, "Username or email is already taken.");

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return (false, "User creation failed.");

            await _familyTreeService.CreateDefaultTreeAsync(user.Id, dto);

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var frontendBaseUrl = _config["Frontend:BaseUrl"];
            var confirmationLink = $"{frontendBaseUrl}/auth/activate/{user.Id}/{WebUtility.UrlEncode(token)}";
            var subject = "Activate Your Account";
            var body = _emailService.GetActivationEmailBody(user.UserName ?? user.Email!, confirmationLink);

            await _emailService.SendAsync(user.Email!, subject, body);

            _logger.LogInformation("User {UserId} registered successfully", user.Id);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed");
            return (false, "Registration failed: unable to send activation email. Please try again.");
        }
    }
}