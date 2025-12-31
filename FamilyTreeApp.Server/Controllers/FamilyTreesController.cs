using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Dtos.TreeCollaborator;
using FamilyTreeApp.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FamilyTreeApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ActiveUserOnly")]
public class FamilyTreesController : ControllerBase
{
    private readonly IFamilyTreeService _familyTreeService;
    private readonly ILogger<FamilyTreesController> _logger;

    public FamilyTreesController(
        IFamilyTreeService familyTreeService,
        ILogger<FamilyTreesController> logger)
    {
        _familyTreeService = familyTreeService;
        _logger = logger;
    }

    // POST /api/familytrees - Create new tree
    [HttpPost]
    public async Task<ActionResult<FamilyTreeDto>> CreateTree([FromBody] CreateTreeDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, tree, error) = await _familyTreeService.CreateTreeAsync(userId.Value, dto);

        if (!success)
            return BadRequest(new { message = error });

        return CreatedAtAction(nameof(GetTreeById), new { id = tree!.Id }, tree);
    }

    // GET /api/familytrees - Get user's trees
    [HttpGet]
    public async Task<ActionResult<List<TreeSummaryDto>>> GetUserTrees()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, trees, error) = await _familyTreeService.GetUserTreesAsync(userId.Value);

        if (!success)
            return BadRequest(new { message = error });

        return Ok(trees);
    }

    // GET /api/familytrees/{id} - Get tree details
    [HttpGet("{id}")]
    public async Task<ActionResult<FamilyTreeDto>> GetTreeById(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, tree, error) = await _familyTreeService.GetTreeByIdAsync(id, userId.Value);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "You don't have access to this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return Ok(tree);
    }

    // PUT /api/familytrees/{id} - Update tree
    [HttpPut("{id}")]
    public async Task<ActionResult<FamilyTreeDto>> UpdateTree(int id, [FromBody] UpdateTreeDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, tree, error) = await _familyTreeService.UpdateTreeAsync(id, userId.Value, dto);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "You don't have permission to edit this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return Ok(tree);
    }

    // DELETE /api/familytrees/{id} - Delete tree
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTree(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _familyTreeService.DeleteTreeAsync(id, userId.Value);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "Only the owner can delete this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return NoContent();
    }

    // POST /api/familytrees/{id}/share - Share with user
    [HttpPost("{id}/share")]
    public async Task<ActionResult<CollaboratorDto>> ShareTree(int id, [FromBody] ShareTreeDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, collaborator, error) = await _familyTreeService.ShareTreeAsync(id, userId.Value, dto);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "User not found" => NotFound(new { message = error }),
                "You don't have permission to share this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return Ok(collaborator);
    }

    // GET /api/familytrees/{id}/collaborators - Get tree collaborators
    [HttpGet("{id}/collaborators")]
    public async Task<ActionResult<List<CollaboratorDto>>> GetCollaborators(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, collaborators, error) = await _familyTreeService.GetCollaboratorsAsync(id, userId.Value);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "You don't have access to this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return Ok(collaborators);
    }

    // DELETE /api/familytrees/{id}/collaborators/{collaboratorId} - Remove collaborator
    [HttpDelete("{id}/collaborators/{collaboratorId}")]
    public async Task<IActionResult> RemoveCollaborator(int id, int collaboratorId)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _familyTreeService.RemoveCollaboratorAsync(id, collaboratorId, userId.Value);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "Collaborator not found" => NotFound(new { message = error }),
                "You don't have permission to manage collaborators" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return NoContent();
    }

    // Helper method
    private int? GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}