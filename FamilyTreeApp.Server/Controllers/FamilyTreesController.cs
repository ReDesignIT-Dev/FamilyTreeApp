using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FamilyTreeApp.Server.Controllers;

[ApiController]
[Route("api/familytrees")]
[Authorize(Policy = "ActiveUserOnly")]
public class FamilyTreesController : ControllerBase
{
    private readonly IFamilyTreeService _familyTreeService;

    public FamilyTreesController(IFamilyTreeService familyTreeService)
    {
        _familyTreeService = familyTreeService;
    }

    [HttpGet("my")]
    public async Task<ActionResult<FamilyTreeDto>> GetMyTree()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var (success, tree, error) = await _familyTreeService.GetUserTreeAsync(userId.Value);

        if (!success)
            return NotFound(new { message = error });

        return Ok(tree);
    }

    [HttpPut("my")]
    public async Task<ActionResult<FamilyTreeDto>> UpdateMyTree([FromBody] UpdateTreeDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var (success, tree, error) = await _familyTreeService.UpdateTreeAsync(userId.Value, dto);

        if (!success)
            return NotFound(new { message = error });

        return Ok(tree);
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var id) ? id : null;
    }
}