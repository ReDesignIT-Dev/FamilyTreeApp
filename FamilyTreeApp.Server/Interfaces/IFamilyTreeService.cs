using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Dtos.User;

namespace FamilyTreeApp.Server.Interfaces;

public interface IFamilyTreeService
{
    Task CreateDefaultTreeAsync(int userId, RegisterDto dto);
    Task<(bool Success, FamilyTreeDto? Tree, string? Error)> GetUserTreeAsync(int userId);
    Task<(bool Success, FamilyTreeDto? Tree, string? Error)> UpdateTreeAsync(int userId, UpdateTreeDto dto);
}