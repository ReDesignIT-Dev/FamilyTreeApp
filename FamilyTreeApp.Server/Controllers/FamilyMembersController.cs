using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FamilyTreeApp.Server.Controllers;

[ApiController]
[Route("api/trees/{treeId}/members")]
[Authorize(Policy = "ActiveUserOnly")]
public class FamilyMembersController : ControllerBase
{
    private readonly FamilyTreeContext _context;
    private readonly IHtmlSanitizerService _htmlSanitizer;
    private readonly ILogger<FamilyMembersController> _logger;

    public FamilyMembersController(
        FamilyTreeContext context,
        IHtmlSanitizerService htmlSanitizer,
        ILogger<FamilyMembersController> logger)
    {
        _context = context;
        _htmlSanitizer = htmlSanitizer;
        _logger = logger;
    }

    // POST /api/trees/{treeId}/members - Add person to tree
    [HttpPost]
    public async Task<ActionResult<PersonDto>> AddPersonToTree(int treeId, [FromBody] CreatePersonDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        // Check if user can edit this tree
        if (!await CanEditTree(tree, userId.Value))
            return Forbid();

        // Create new person
        var person = new Person
        {
            FirstName = dto.FirstName.Trim(),
            MiddleName = dto.MiddleName?.Trim(),
            LastName = dto.LastName.Trim(),
            MaidenName = dto.MaidenName?.Trim(),
            BirthDate = dto.BirthDate,
            BirthPlace = dto.BirthPlace?.Trim(),
            DeathDate = dto.DeathDate,
            DeathPlace = dto.DeathPlace?.Trim(),
            Gender = dto.Gender?.Trim(),
            Biography = !string.IsNullOrWhiteSpace(dto.Biography) 
                ? _htmlSanitizer.Sanitize(dto.Biography) 
                : null,
            CreatedAt = DateTime.UtcNow
        };

        // Validate dates
        if (person.DeathDate.HasValue && person.BirthDate.HasValue)
        {
            if (person.DeathDate < person.BirthDate)
                return BadRequest(new { message = "Death date cannot be before birth date" });
        }

        _context.People.Add(person);
        await _context.SaveChangesAsync();

        // Add person to tree
        var treeMember = new TreeMember
        {
            FamilyTreeId = treeId,
            PersonId = person.Id
        };

        _context.TreeMembers.Add(treeMember);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} added person {PersonId} to tree {TreeId}",
            userId, person.Id, treeId);

        return CreatedAtAction(
            nameof(GetPersonById),
            new { treeId, id = person.Id },
            MapToPersonDto(person));
    }

    // GET /api/trees/{treeId}/members - Get all members
    [HttpGet]
    public async Task<ActionResult<List<PersonSummaryDto>>> GetTreeMembers(int treeId)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees
            .Include(t => t.Members)
                .ThenInclude(tm => tm.Person)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        // Check if user has access to this tree
        if (!await HasAccessToTree(tree, userId.Value))
            return Forbid();

        var members = tree.Members
            .Select(tm => MapToPersonSummaryDto(tm.Person))
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .ToList();

        return Ok(members);
    }

    // GET /api/trees/{treeId}/members/{id} - Get person details
    [HttpGet("{id}")]
    public async Task<ActionResult<PersonDto>> GetPersonById(int treeId, int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        if (!await HasAccessToTree(tree, userId.Value))
            return Forbid();

        // Check if person is in this tree
        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == id);

        if (treeMember == null)
            return NotFound(new { message = "Person not found in this tree" });

        var person = await _context.People
            .Include(p => p.ParentRelationships)
                .ThenInclude(r => r.Child)
            .Include(p => p.ChildRelationships)
                .ThenInclude(r => r.Parent)
            .Include(p => p.MediaFiles)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (person == null)
            return NotFound(new { message = "Person not found" });

        return Ok(MapToPersonDto(person));
    }

    // PUT /api/trees/{treeId}/members/{id} - Update person
    [HttpPut("{id}")]
    public async Task<ActionResult<PersonDto>> UpdatePerson(int treeId, int id, [FromBody] UpdatePersonDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        if (!await CanEditTree(tree, userId.Value))
            return Forbid();

        // Check if person is in this tree
        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == id);

        if (treeMember == null)
            return NotFound(new { message = "Person not found in this tree" });

        var person = await _context.People.FindAsync(id);
        if (person == null)
            return NotFound(new { message = "Person not found" });

        // Update person details
        person.FirstName = dto.FirstName.Trim();
        person.MiddleName = dto.MiddleName?.Trim();
        person.LastName = dto.LastName.Trim();
        person.MaidenName = dto.MaidenName?.Trim();
        person.BirthDate = dto.BirthDate;
        person.BirthPlace = dto.BirthPlace?.Trim();
        person.DeathDate = dto.DeathDate;
        person.DeathPlace = dto.DeathPlace?.Trim();
        person.Gender = dto.Gender?.Trim();
        person.Biography = !string.IsNullOrWhiteSpace(dto.Biography)
            ? _htmlSanitizer.Sanitize(dto.Biography)
            : null;

        // Validate dates
        if (person.DeathDate.HasValue && person.BirthDate.HasValue)
        {
            if (person.DeathDate < person.BirthDate)
                return BadRequest(new { message = "Death date cannot be before birth date" });
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} updated person {PersonId} in tree {TreeId}",
            userId, person.Id, treeId);

        return Ok(MapToPersonDto(person));
    }

    // DELETE /api/trees/{treeId}/members/{id} - Remove from tree
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemovePersonFromTree(int treeId, int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return NotFound(new { message = "Family tree not found" });

        if (!await CanEditTree(tree, userId.Value))
            return Forbid();

        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == id);

        if (treeMember == null)
            return NotFound(new { message = "Person not found in this tree" });

        // Check if person has relationships in this tree
        var hasRelationships = await _context.Relationships
            .AnyAsync(r => r.ParentId == id || r.ChildId == id);

        if (hasRelationships)
        {
            return BadRequest(new 
            { 
                message = "Cannot remove person with existing relationships. Remove relationships first." 
            });
        }

        // Remove from tree (not deleting the person, just the association)
        _context.TreeMembers.Remove(treeMember);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} removed person {PersonId} from tree {TreeId}",
            userId, id, treeId);

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

    private PersonDto MapToPersonDto(Person person)
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

    private PersonSummaryDto MapToPersonSummaryDto(Person person)
    {
        return new PersonSummaryDto
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            BirthDate = person.BirthDate,
            DeathDate = person.DeathDate,
            ProfilePhotoUrl = person.ProfilePhotoUrl
        };
    }
}