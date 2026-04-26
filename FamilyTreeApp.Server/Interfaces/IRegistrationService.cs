using FamilyTreeApp.Server.Dtos.User;

namespace FamilyTreeApp.Server.Interfaces;

public interface IRegistrationService
{
    Task<(bool Success, string? Error)> RegisterAsync(RegisterDto dto);
}