using FamilyTreeApp.Server.Constants;
using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Services;

public partial class FamilyMemberService(
    FamilyTreeContext context,
    ILogger<FamilyMemberService> logger,
    IPersonFactory personFactory) : IFamilyMemberService
{
    private readonly FamilyTreeContext _context = context;
    private readonly ILogger<FamilyMemberService> _logger = logger;
    private readonly IPersonFactory _personFactory = personFactory;

    public async Task<(bool Success, Person? Person, string? Error)> AddPersonToTreeAsync(
        int treeId,
        int userId,
        CreatePersonDto dto)
    {
        var tree = await _context.FamilyTrees
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, ServiceErrors.FamilyTreeNotFound);

        if (dto.DeathDate.HasValue && dto.BirthDate.HasValue && dto.DeathDate < dto.BirthDate)
            return (false, null, ServiceErrors.DeathBeforeBirth);

        var person = _personFactory.Create(dto);

        _context.People.Add(person);
        await _context.SaveChangesAsync();

        var treeMember = new TreeMember
        {
            FamilyTreeId = treeId,
            PersonId = person.Id
        };

        _context.TreeMembers.Add(treeMember);
        await _context.SaveChangesAsync();

        LogPersonAddedToTree(userId, person.Id, treeId);

        return (true, person, null);
    }

    public async Task<(bool Success, List<PersonSummaryDto>? Members, string? Error)> GetTreeMembersAsync(
        int treeId,
        int userId)
    {
        var tree = await _context.FamilyTrees
            .AsNoTracking()
            .Include(t => t.Members)
                .ThenInclude(tm => tm.Person)
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, ServiceErrors.FamilyTreeNotFound);

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
        var tree = await _context.FamilyTrees
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == treeId);

        if (tree == null)
            return (false, null, ServiceErrors.FamilyTreeNotFound);

        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
            return (false, null, ServiceErrors.PersonNotFoundInTree);

        var person = await _context.People
            .AsNoTracking()
            .Include(p => p.ParentRelationships)
                .ThenInclude(r => r.Child)
            .Include(p => p.ChildRelationships)
                .ThenInclude(r => r.Parent)
            .Include(p => p.MediaFiles)
            .FirstOrDefaultAsync(p => p.Id == personId);

        if (person == null)
            return (false, null, ServiceErrors.PersonNotFound);

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
            return (false, null, ServiceErrors.FamilyTreeNotFound);

        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
            return (false, null, ServiceErrors.PersonNotFoundInTree);

        var person = await _context.People.FindAsync(personId);
        if (person == null)
            return (false, null, ServiceErrors.PersonNotFound);

        _personFactory.ApplyUpdate(person, dto);

        if (person.DeathDate.HasValue && person.BirthDate.HasValue && person.DeathDate < person.BirthDate)
            return (false, null, ServiceErrors.DeathBeforeBirth);

        await _context.SaveChangesAsync();

        LogPersonUpdated(userId, personId, treeId);

        return (true, MapToPersonDto(person), null);
    }

    public async Task<(bool Success, string? Error)> RemovePersonFromTreeAsync(
        int treeId,
        int personId,
        int userId)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return (false, ServiceErrors.FamilyTreeNotFound);

        if (tree.OwnerPersonId == personId)
            return (false, ServiceErrors.CannotRemoveOwner);

        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
            return (false, ServiceErrors.PersonNotFoundInTree);

        var hasRelationships = await _context.Relationships
            .AnyAsync(r => r.ParentId == personId || r.ChildId == personId);

        if (hasRelationships)
            return (false, ServiceErrors.PersonHasRelationships);

        _context.TreeMembers.Remove(treeMember);
        await _context.SaveChangesAsync();

        LogPersonRemovedFromTree(userId, personId, treeId);

        return (true, null);
    }

    private static PersonDto MapToPersonDto(Person person)
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

    private static PersonSummaryDto MapToPersonSummaryDto(Person person)
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