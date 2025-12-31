using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Dtos.TreeCollaborator;
using FamilyTreeApp.Server.Models;

namespace FamilyTreeApp.Server.Interfaces;

public interface IFamilyTreeService
{
    Task<(bool Success, FamilyTreeDto? Tree, string? Error)> CreateTreeAsync(int userId, CreateTreeDto dto);
    Task<(bool Success, List<TreeSummaryDto>? Trees, string? Error)> GetUserTreesAsync(int userId);
    Task<(bool Success, FamilyTreeDto? Tree, string? Error)> GetTreeByIdAsync(int treeId, int userId);
    Task<(bool Success, FamilyTreeDto? Tree, string? Error)> UpdateTreeAsync(int treeId, int userId, UpdateTreeDto dto);
    Task<(bool Success, string? Error)> DeleteTreeAsync(int treeId, int userId);
    Task<(bool Success, CollaboratorDto? Collaborator, string? Error)> ShareTreeAsync(int treeId, int userId, ShareTreeDto dto);
    Task<(bool Success, List<CollaboratorDto>? Collaborators, string? Error)> GetCollaboratorsAsync(int treeId, int userId);
    Task<(bool Success, string? Error)> RemoveCollaboratorAsync(int treeId, int collaboratorId, int userId);
}