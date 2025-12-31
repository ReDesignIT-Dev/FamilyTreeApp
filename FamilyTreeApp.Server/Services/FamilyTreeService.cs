using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Dtos.TreeCollaborator;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Services;

public class FamilyTreeService : IFamilyTreeService
{
    private readonly FamilyTreeContext _context;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<FamilyTreeService> _logger;

    public FamilyTreeService(
        FamilyTreeContext context,
        UserManager<User> userManager,
        ILogger<FamilyTreeService> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<(bool Success, FamilyTreeDto? Tree, string? Error)> CreateTreeAsync(
        int userId, 
        CreateTreeDto dto)
    {
        var tree = new FamilyTree
        {
            Name = dto.Name,
            Description = dto.Description,
            OwnerId = userId,
            IsPublic = dto.IsPublic,
            CreatedAt = DateTime.UtcNow
        };

        _context.FamilyTrees.Add(tree);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} created family tree {TreeId}", userId, tree.Id);

        return (true, await MapToFamilyTreeDto(tree), null);
    }

    public async Task<(bool Success, List<TreeSummaryDto>? Trees, string? Error)> GetUserTreesAsync(int userId)
    {
        var ownedTrees = await _context.FamilyTrees
            .Where(t => t.OwnerId == userId)
            .Include(t => t.Members)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var sharedTrees = await _context.TreeCollaborators
            .Where(tc => tc.UserId == userId)
            .Include(tc => tc.FamilyTree)
                .ThenInclude(t => t.Members)
            .Select(tc => tc.FamilyTree)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var allTrees = ownedTrees
            .Concat(sharedTrees)
            .DistinctBy(t => t.Id)
            .Select(MapToTreeSummaryDto)
            .ToList();

        return (true, allTrees, null);
    }

    public async Task<(bool Success, FamilyTreeDto? Tree, string? Error)> GetTreeByIdAsync(
        int treeId, 
        int userId)
    {
        var tree = await _context.FamilyTrees
            .Include(t => t.Owner)
            .Include(t => t.Members)
            .Include(t => t.Collaborators)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, "Family tree not found");

        // Check access permissions
        if (!await HasAccessToTree(tree, userId))
            return (false, null, "You don't have access to this tree");

        return (true, await MapToFamilyTreeDto(tree), null);
    }

    public async Task<(bool Success, FamilyTreeDto? Tree, string? Error)> UpdateTreeAsync(
        int treeId, 
        int userId, 
        UpdateTreeDto dto)
    {
        var tree = await _context.FamilyTrees
            .Include(t => t.Owner)
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, "Family tree not found");

        // Only owner or collaborators with Admin permission can update
        if (!await CanEditTree(tree, userId))
            return (false, null, "You don't have permission to edit this tree");

        tree.Name = dto.Name;
        tree.Description = dto.Description;
        tree.IsPublic = dto.IsPublic;
        tree.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated family tree {TreeId}", userId, tree.Id);

        return (true, await MapToFamilyTreeDto(tree), null);
    }

    public async Task<(bool Success, string? Error)> DeleteTreeAsync(int treeId, int userId)
    {
        var tree = await _context.FamilyTrees
            .Include(t => t.Members)
            .Include(t => t.Collaborators)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, "Family tree not found");

        // Only owner can delete
        if (tree.OwnerId != userId)
            return (false, "Only the owner can delete this tree");

        _context.FamilyTrees.Remove(tree);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} deleted family tree {TreeId}", userId, tree.Id);

        return (true, null);
    }

    public async Task<(bool Success, CollaboratorDto? Collaborator, string? Error)> ShareTreeAsync(
        int treeId, 
        int userId, 
        ShareTreeDto dto)
    {
        var tree = await _context.FamilyTrees
            .Include(t => t.Collaborators)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, "Family tree not found");

        // Only owner or Admin collaborators can share
        if (!await CanManageCollaborators(tree, userId))
            return (false, null, "You don't have permission to share this tree");

        // Find user by email
        var targetUser = await _userManager.FindByEmailAsync(dto.UserEmail);
        if (targetUser == null)
            return (false, null, "User not found");

        // Check if already a collaborator
        var existingCollaborator = await _context.TreeCollaborators
            .FirstOrDefaultAsync(tc => tc.FamilyTreeId == treeId && tc.UserId == targetUser.Id);

        if (existingCollaborator != null)
            return (false, null, "User is already a collaborator");

        // Can't share with owner
        if (tree.OwnerId == targetUser.Id)
            return (false, null, "Cannot share tree with its owner");

        var collaborator = new TreeCollaborator
        {
            FamilyTreeId = treeId,
            UserId = targetUser.Id,
            Permission = dto.Permission,
            InvitedAt = DateTime.UtcNow
        };

        _context.TreeCollaborators.Add(collaborator);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} shared tree {TreeId} with user {TargetUserId} with {Permission} permission",
            userId, treeId, targetUser.Id, dto.Permission);

        var collaboratorDto = new CollaboratorDto
        {
            Id = collaborator.Id,
            UserId = targetUser.Id,
            Username = targetUser.UserName!,
            Email = targetUser.Email!,
            Permission = collaborator.Permission,
            InvitedAt = collaborator.InvitedAt
        };

        return (true, collaboratorDto, null);
    }

    public async Task<(bool Success, List<CollaboratorDto>? Collaborators, string? Error)> GetCollaboratorsAsync(
        int treeId, 
        int userId)
    {
        var tree = await _context.FamilyTrees
            .Include(t => t.Collaborators)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, "Family tree not found");

        if (!await HasAccessToTree(tree, userId))
            return (false, null, "You don't have access to this tree");

        var collaborators = tree.Collaborators.Select(c => new CollaboratorDto
        {
            Id = c.Id,
            UserId = c.UserId,
            Username = c.User.UserName!,
            Email = c.User.Email!,
            Permission = c.Permission,
            InvitedAt = c.InvitedAt
        }).ToList();

        return (true, collaborators, null);
    }

    public async Task<(bool Success, string? Error)> RemoveCollaboratorAsync(
        int treeId, 
        int collaboratorId, 
        int userId)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return (false, "Family tree not found");

        if (!await CanManageCollaborators(tree, userId))
            return (false, "You don't have permission to manage collaborators");

        var collaborator = await _context.TreeCollaborators.FindAsync(collaboratorId);
        if (collaborator == null || collaborator.FamilyTreeId != treeId)
            return (false, "Collaborator not found");

        _context.TreeCollaborators.Remove(collaborator);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} removed collaborator {CollaboratorId} from tree {TreeId}",
            userId, collaboratorId, treeId);

        return (true, null);
    }

    // Helper methods
    private async Task<bool> HasAccessToTree(FamilyTree tree, int userId)
    {
        // Owner has access
        if (tree.OwnerId == userId)
            return true;

        // Public trees are accessible
        if (tree.IsPublic)
            return true;

        // Check if user is a collaborator
        var isCollaborator = await _context.TreeCollaborators
            .AnyAsync(tc => tc.FamilyTreeId == tree.Id && tc.UserId == userId);

        return isCollaborator;
    }

    private async Task<bool> CanEditTree(FamilyTree tree, int userId)
    {
        // Owner can edit
        if (tree.OwnerId == userId)
            return true;

        // Check if collaborator has Edit or Admin permission
        var collaborator = await _context.TreeCollaborators
            .FirstOrDefaultAsync(tc => tc.FamilyTreeId == tree.Id && tc.UserId == userId);

        return collaborator?.Permission is "Edit" or "Admin";
    }

    private async Task<bool> CanManageCollaborators(FamilyTree tree, int userId)
    {
        // Owner can manage
        if (tree.OwnerId == userId)
            return true;

        // Check if collaborator has Admin permission
        var collaborator = await _context.TreeCollaborators
            .FirstOrDefaultAsync(tc => tc.FamilyTreeId == tree.Id && tc.UserId == userId);

        return collaborator?.Permission == "Admin";
    }

    private async Task<FamilyTreeDto> MapToFamilyTreeDto(FamilyTree tree)
    {
        var owner = tree.Owner ?? await _context.Users.FindAsync(tree.OwnerId);

        return new FamilyTreeDto
        {
            Id = tree.Id,
            Name = tree.Name,
            Description = tree.Description,
            OwnerId = tree.OwnerId,
            OwnerUsername = owner?.UserName ?? "Unknown",
            IsPublic = tree.IsPublic,
            CreatedAt = tree.CreatedAt,
            UpdatedAt = tree.UpdatedAt,
            MemberCount = tree.Members?.Count ?? 0
        };
    }

    private TreeSummaryDto MapToTreeSummaryDto(FamilyTree tree)
    {
        return new TreeSummaryDto
        {
            Id = tree.Id,
            Name = tree.Name,
            Description = tree.Description,
            IsPublic = tree.IsPublic,
            MemberCount = tree.Members?.Count ?? 0,
            CreatedAt = tree.CreatedAt
        };
    }
}