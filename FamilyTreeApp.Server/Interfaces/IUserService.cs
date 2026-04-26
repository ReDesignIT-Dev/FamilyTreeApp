using FamilyTreeApp.Server.Dtos.User;

namespace FamilyTreeApp.Server.Interfaces;

public interface IUserService
{
    Task<UserDto?> RegisterAsync(RegisterDto dto);
    Task<UserDto?> LoginAsync(LoginDto dto);
    Task<bool> UserExistsAsync(string username);
    Task<List<AdminUserDto>> GetAllUsersWithRolesAsync();
    Task<UserDto?> RefreshTokenAsync(string refreshToken);
}
