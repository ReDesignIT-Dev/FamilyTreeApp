using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FamilyTreeApp.Server.Controllers;

[ApiController]
[Route("api/trees/{treeId}/members")]
[Authorize(Policy = "ActiveUserOnly")]
public class FamilyMembersController : ControllerBase
{
    private readonly IFamilyMemberService _familyMemberService;
    private readonly ILogger<FamilyMembersController> _logger;

    public FamilyMembersController(
        IFamilyMemberService familyMemberService,
        ILogger<FamilyMembersController> logger)
    {
        _familyMemberService = familyMemberService;
        _logger = logger;
    }

    // POST /api/trees/{treeId}/members - Add person to tree
    [HttpPost]
    public async Task<ActionResult<PersonDto>> AddPersonToTree(int treeId, [FromBody] CreatePersonDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, person, error) = await _familyMemberService.AddPersonToTreeAsync(treeId, userId.Value, dto);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "You don't have permission to edit this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return CreatedAtAction(
            nameof(GetPersonById),
            new { treeId, id = person!.Id },
            MapToPersonDto(person));
    }

    // GET /api/trees/{treeId}/members - Get all members
    [HttpGet]
    public async Task<ActionResult<List<PersonSummaryDto>>> GetTreeMembers(int treeId)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, members, error) = await _familyMemberService.GetTreeMembersAsync(treeId, userId.Value);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "You don't have access to this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return Ok(members);
    }

    // GET /api/trees/{treeId}/members/{id} - Get person details
    [HttpGet("{id}")]
    public async Task<ActionResult<PersonDto>> GetPersonById(int treeId, int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, person, error) = await _familyMemberService.GetPersonByIdAsync(treeId, id, userId.Value);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "Person not found in this tree" => NotFound(new { message = error }),
                "Person not found" => NotFound(new { message = error }),
                "You don't have access to this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return Ok(person);
    }

    // PUT /api/trees/{treeId}/members/{id} - Update person
    [HttpPut("{id}")]
    public async Task<ActionResult<PersonDto>> UpdatePerson(int treeId, int id, [FromBody] UpdatePersonDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, person, error) = await _familyMemberService.UpdatePersonAsync(treeId, id, userId.Value, dto);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "Person not found in this tree" => NotFound(new { message = error }),
                "Person not found" => NotFound(new { message = error }),
                "You don't have permission to edit this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return Ok(person);
    }

    // DELETE /api/trees/{treeId}/members/{id} - Remove from tree
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemovePersonFromTree(int treeId, int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _familyMemberService.RemovePersonFromTreeAsync(treeId, id, userId.Value);

        if (!success)
            return error switch
            {
                "Family tree not found" => NotFound(new { message = error }),
                "Person not found in this tree" => NotFound(new { message = error }),
                "You don't have permission to edit this tree" => Forbid(),
                _ => BadRequest(new { message = error })
            };

        return NoContent();
    }

    // Helper methods
    private int? GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private PersonDto MapToPersonDto(Models.Person person)
    {
        return new PersonDto
        {
            Id = person.Id,
            FirstName = person.FirstName,
            MiddleName = person.MiddleName,
            LastName = person.LastName,
            MaidenName = person.MaidenName,
            BirthDate = person.BirthDate,
            BirthPlace = person.BirthPlace,
            DeathDate = person.DeathDate,
            DeathPlace = person.DeathPlace,
            Gender = person.Gender,
            Biography = person.Biography,
            ProfilePhotoUrl = person.ProfilePhotoUrl,
            CreatedAt = person.CreatedAt
        };
    }
}