using FamilyTreeApp.Server.Dtos.FamilyTree;

namespace FamilyTreeApp.Server.Interfaces;

public interface IFamilyTreeService
{
    Task CreateDefaultTreeAsync(int userId, string username);
    Task<(bool Success, FamilyTreeDto? Tree, string? Error)> GetUserTreeAsync(int userId);
    Task<(bool Success, FamilyTreeDto? Tree, string? Error)> UpdateTreeAsync(int userId, UpdateTreeDto dto);
}