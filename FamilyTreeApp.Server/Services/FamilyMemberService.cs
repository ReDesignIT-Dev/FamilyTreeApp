using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Services;

public class FamilyMemberService : IFamilyMemberService
{
    private readonly FamilyTreeContext _context;
    private readonly IHtmlSanitizerService _htmlSanitizer;
    private readonly ILogger<FamilyMemberService> _logger;

    public FamilyMemberService(
        FamilyTreeContext context,
        IHtmlSanitizerService htmlSanitizer,
        ILogger<FamilyMemberService> logger)
    {
        _context = context;
        _htmlSanitizer = htmlSanitizer;
        _logger = logger;
    }

    public async Task<(bool Success, Person? Person, string? Error)> AddPersonToTreeAsync(
        int treeId, 
        int userId, 
        CreatePersonDto dto)
    {
        var tree = await _context.FamilyTrees
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, "Family tree not found");

        if (!await CanEditTreeAsync(treeId, userId))
            return (false, null, "You don't have permission to edit this tree");

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
                return (false, null, "Death date cannot be before birth date");
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

        return (true, person, null);
    }

    public async Task<(bool Success, List<PersonSummaryDto>? Members, string? Error)> GetTreeMembersAsync(
        int treeId, 
        int userId)
    {
        var tree = await _context.FamilyTrees
            .Include(t => t.Members)
                .ThenInclude(tm => tm.Person)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, "Family tree not found");

        if (!await HasAccessToTreeAsync(treeId, userId))
            return (false, null, "You don't have access to this tree");

        var members = tree.Members
            .Select(tm => MapToPersonSummaryDto(tm.Person))
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .ToList();

        return (true, members, null);
    }

    public async Task<(bool Success, PersonDto? Person, string? Error)> GetPersonByIdAsync(
        int treeId, 
        int personId, 
        int userId)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return (false, null, "Family tree not found");

        if (!await HasAccessToTreeAsync(treeId, userId))
            return (false, null, "You don't have access to this tree");

        // Check if person is in this tree
        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
            return (false, null, "Person not found in this tree");

        var person = await _context.People
            .Include(p => p.ParentRelationships)
                .ThenInclude(r => r.Child)
            .Include(p => p.ChildRelationships)
                .ThenInclude(r => r.Parent)
            .Include(p => p.MediaFiles)
            .FirstOrDefaultAsync(p => p.Id == personId);

        if (person == null)
            return (false, null, "Person not found");

        return (true, MapToPersonDto(person), null);
    }

    public async Task<(bool Success, PersonDto? Person, string? Error)> UpdatePersonAsync(
        int treeId, 
        int personId, 
        int userId, 
        UpdatePersonDto dto)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return (false, null, "Family tree not found");

        if (!await CanEditTreeAsync(treeId, userId))
            return (false, null, "You don't have permission to edit this tree");

        // Check if person is in this tree
        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
            return (false, null, "Person not found in this tree");

        var person = await _context.People.FindAsync(personId);
        if (person == null)
            return (false, null, "Person not found");

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
                return (false, null, "Death date cannot be before birth date");
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} updated person {PersonId} in tree {TreeId}",
            userId, personId, treeId);

        return (true, MapToPersonDto(person), null);
    }

    public async Task<(bool Success, string? Error)> RemovePersonFromTreeAsync(
        int treeId, 
        int personId, 
        int userId)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return (false, "Family tree not found");

        if (!await CanEditTreeAsync(treeId, userId))
            return (false, "You don't have permission to edit this tree");

        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
            return (false, "Person not found in this tree");

        // Check if person has relationships in this tree
        var hasRelationships = await _context.Relationships
            .AnyAsync(r => r.ParentId == personId || r.ChildId == personId);

        if (hasRelationships)
        {
            return (false, "Cannot remove person with existing relationships. Remove relationships first.");
        }

        // Remove from tree (not deleting the person, just the association)
        _context.TreeMembers.Remove(treeMember);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} removed person {PersonId} from tree {TreeId}",
            userId, personId, treeId);

        return (true, null);
    }

    public async Task<bool> HasAccessToTreeAsync(int treeId, int userId)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return false;

        // Owner has access
        if (tree.OwnerId == userId)
            return true;

        // Public trees are accessible
        if (tree.IsPublic)
            return true;

        // Check if user is a collaborator
        var isCollaborator = await _context.TreeCollaborators
            .AnyAsync(tc => tc.FamilyTreeId == treeId && tc.UserId == userId);

        return isCollaborator;
    }

    public async Task<bool> CanEditTreeAsync(int treeId, int userId)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return false;

        // Owner can edit
        if (tree.OwnerId == userId)
            return true;

        // Check if collaborator has Edit or Admin permission
        var collaborator = await _context.TreeCollaborators
            .FirstOrDefaultAsync(tc => tc.FamilyTreeId == treeId && tc.UserId == userId);

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