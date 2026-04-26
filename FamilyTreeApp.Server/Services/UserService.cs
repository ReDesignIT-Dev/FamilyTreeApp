using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.User;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using System.Security.Cryptography;

namespace FamilyTreeApp.Server.Services;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly FamilyTreeContext _dbContext;
    private readonly ITokenService _tokenService;
    private readonly IUserRoleService _userRoleService;

    public UserService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        FamilyTreeContext dbContext,
        ITokenService tokenService,
        IUserRoleService userRoleService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _dbContext = dbContext;
        _tokenService = tokenService;
        _userRoleService = userRoleService;


    }

    public async Task<UserDto?> RegisterAsync(RegisterDto dto)
    {
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return null;

        return new UserDto
        {
            Id = user.Id,
            Username = user.UserName!,
        };
    }


    public async Task<UserDto?> LoginAsync(LoginDto dto)
    {
        if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            return null;

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return null;

        if (!user.EmailConfirmed || !user.IsActive) return null;

        var result = await _signInManager.PasswordSignInAsync(user, dto.Password, isPersistent: false, lockoutOnFailure: true);
        if (!result.Succeeded) return null;

        var sessionId = Guid.NewGuid().ToString();
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var expiresAt = DateTime.UtcNow.AddDays(7);

        _dbContext.UserSessions.Add(new UserSession
        {
            UserId = user.Id,
            SessionId = sessionId,
            RefreshToken = refreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            IsRevoked = false
        });
        await _dbContext.SaveChangesAsync();

        var roles = await _userRoleService.GetUserRolesAsync(user.Id);
        var token = _tokenService.CreateToken(user, sessionId, DateTime.UtcNow.AddMinutes(15), roles);

        return new UserDto
        {
            Id = user.Id,
            Username = user.UserName ?? string.Empty,
            Token = token,
            RefreshToken = refreshToken
        };
    }

    public async Task<UserDto?> RefreshTokenAsync(string refreshToken)
    {
        var session = await _dbContext.UserSessions
            .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && !s.IsRevoked && s.ExpiresAt > DateTime.UtcNow);

        if (session == null) return null;

        var user = await _userManager.FindByIdAsync(session.UserId.ToString());
        if (user == null || !user.IsActive) return null;

        // Rotate refresh token
        session.IsRevoked = true;

        var newSessionId = Guid.NewGuid().ToString();
        var newRefreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var newExpiresAt = DateTime.UtcNow.AddDays(7);

        _dbContext.UserSessions.Add(new UserSession
        {
            UserId = user.Id,
            SessionId = newSessionId,
            RefreshToken = newRefreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = newExpiresAt,
            IsRevoked = false
        });

        await _dbContext.SaveChangesAsync();

        var roles = await _userRoleService.GetUserRolesAsync(user.Id);
        var newToken = _tokenService.CreateToken(user, newSessionId, DateTime.UtcNow.AddMinutes(15), roles);

        return new UserDto
        {
            Id = user.Id,
            Username = user.UserName ?? string.Empty,
            Token = newToken,
            RefreshToken = newRefreshToken
        };
    }

    public async Task<bool> UserExistsAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email) != null;
    }

    public async Task<List<AdminUserDto>> GetAllUsersWithRolesAsync()
    {
        var users = _userManager.Users.ToList();
        var result = new List<AdminUserDto>();

        foreach (var user in users)
        {
            var roles = await _userRoleService.GetUserRolesAsync(user.Id);
            result.Add(new AdminUserDto
            {
                Id = user.Id,
                Username = user.UserName ?? "",
                Email = user.Email ?? "",
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                EmailConfirmed = user.EmailConfirmed,
                Roles = roles.ToList()
            });
        }
        return result;
    }

}
