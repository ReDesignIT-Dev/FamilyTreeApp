using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Dtos.TreeCollaborator;
using FamilyTreeApp.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FamilyTreeApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ActiveUserOnly")]
public class FamilyTreesController : ControllerBase
{
    private readonly FamilyTreeContext _context;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<FamilyTreesController> _logger;

    public FamilyTreesController(
        FamilyTreeContext context,
        UserManager<User> userManager,
        ILogger<FamilyTreesController> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    // POST /api/familytrees - Create new tree
    [HttpPost]
    public async Task<ActionResult<FamilyTreeDto>> CreateTree([FromBody] CreateTreeDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = new FamilyTree
        {
            Name = dto.Name,
            Description = dto.Description,
            OwnerId = userId.Value,
            IsPublic = dto.IsPublic,
            CreatedAt = DateTime.UtcNow
        };

        _context.FamilyTrees.Add(tree);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} created family tree {TreeId}", userId, tree.Id);

        return CreatedAtAction(
            nameof(GetTreeById),
            new { id = tree.Id },
            await MapToFamilyTreeDto(tree));
    }

    // GET /api/familytrees - Get user's trees
    [HttpGet]
    public async Task<ActionResult<List<TreeSummaryDto>>> GetUserTrees()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var ownedTrees = await _context.FamilyTrees
            .Where(t => t.OwnerId == userId.Value)
            .Include(t => t.Members)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var sharedTrees = await _context.TreeCollaborators
            .Where(tc => tc.UserId == userId.Value)
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

        return Ok(allTrees);
    }

    // GET /api/familytrees/{id} - Get tree details
    [HttpGet("{id}")]
    public async Task<ActionResult<FamilyTreeDto>> GetTreeById(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees
            .Include(t => t.Owner)
            .Include(t => t.Members)
            .Include(t => t.Collaborators)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        // Check access permissions
        if (!await HasAccessToTree(tree, userId.Value))
            return Forbid();

        return Ok(await MapToFamilyTreeDto(tree));
    }

    // PUT /api/familytrees/{id} - Update tree
    [HttpPut("{id}")]
    public async Task<ActionResult<FamilyTreeDto>> UpdateTree(int id, [FromBody] UpdateTreeDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees
            .Include(t => t.Owner)
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        // Only owner or collaborators with Admin permission can update
        if (!await CanEditTree(tree, userId.Value))
            return Forbid();

        tree.Name = dto.Name;
        tree.Description = dto.Description;
        tree.IsPublic = dto.IsPublic;
        tree.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated family tree {TreeId}", userId, tree.Id);

        return Ok(await MapToFamilyTreeDto(tree));
    }

    // DELETE /api/familytrees/{id} - Delete tree
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTree(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees
            .Include(t => t.Members)
            .Include(t => t.Collaborators)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        // Only owner can delete
        if (tree.OwnerId != userId.Value)
            return Forbid();

        _context.FamilyTrees.Remove(tree);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} deleted family tree {TreeId}", userId, tree.Id);

        return NoContent();
    }

    // POST /api/familytrees/{id}/share - Share with user
    [HttpPost("{id}/share")]
    public async Task<ActionResult<CollaboratorDto>> ShareTree(int id, [FromBody] ShareTreeDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees
            .Include(t => t.Collaborators)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        // Only owner or Admin collaborators can share
        if (!await CanManageCollaborators(tree, userId.Value))
            return Forbid();

        // Find user by email
        var targetUser = await _userManager.FindByEmailAsync(dto.UserEmail);
        if (targetUser == null)
            return NotFound(new { message = "User not found" });

        // Check if already a collaborator
        var existingCollaborator = await _context.TreeCollaborators
            .FirstOrDefaultAsync(tc => tc.FamilyTreeId == id && tc.UserId == targetUser.Id);

        if (existingCollaborator != null)
            return BadRequest(new { message = "User is already a collaborator" });

        // Can't share with owner
        if (tree.OwnerId == targetUser.Id)
            return BadRequest(new { message = "Cannot share tree with its owner" });

        var collaborator = new TreeCollaborator
        {
            FamilyTreeId = id,
            UserId = targetUser.Id,
            Permission = dto.Permission,
            InvitedAt = DateTime.UtcNow
        };

        _context.TreeCollaborators.Add(collaborator);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} shared tree {TreeId} with user {TargetUserId} with {Permission} permission",
            userId, id, targetUser.Id, dto.Permission);

        return Ok(new CollaboratorDto
        {
            Id = collaborator.Id,
            UserId = targetUser.Id,
            Username = targetUser.UserName!,
            Email = targetUser.Email!,
            Permission = collaborator.Permission,
            InvitedAt = collaborator.InvitedAt
        });
    }

    // GET /api/familytrees/{id}/collaborators - Get tree collaborators
    [HttpGet("{id}/collaborators")]
    public async Task<ActionResult<List<CollaboratorDto>>> GetCollaborators(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees
            .Include(t => t.Collaborators)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        if (!await HasAccessToTree(tree, userId.Value))
            return Forbid();

        var collaborators = tree.Collaborators.Select(c => new CollaboratorDto
        {
            Id = c.Id,
            UserId = c.UserId,
            Username = c.User.UserName!,
            Email = c.User.Email!,
            Permission = c.Permission,
            InvitedAt = c.InvitedAt
        }).ToList();

        return Ok(collaborators);
    }

    // DELETE /api/familytrees/{id}/collaborators/{collaboratorId} - Remove collaborator
    [HttpDelete("{id}/collaborators/{collaboratorId}")]
    public async Task<IActionResult> RemoveCollaborator(int id, int collaboratorId)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees.FindAsync(id);
        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        if (!await CanManageCollaborators(tree, userId.Value))
            return Forbid();

        var collaborator = await _context.TreeCollaborators.FindAsync(collaboratorId);
        if (collaborator == null || collaborator.FamilyTreeId != id)
            return NotFound(new { message = "Collaborator not found" });

        _context.TreeCollaborators.Remove(collaborator);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} removed collaborator {CollaboratorId} from tree {TreeId}",
            userId, collaboratorId, id);

        return NoContent();
    }

    // Helper methods
    private int? GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

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