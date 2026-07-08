using FamilyTreeApp.Server.Constants;
using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FamilyTreeApp.Server.Services;

public partial class FamilyMemberService(
    FamilyTreeContext context,
    ILogger<FamilyMemberService> logger,
    IPersonFactory personFactory,
    IHtmlSanitizerService htmlSanitizerService) : IFamilyMemberService
{
    private readonly FamilyTreeContext _context = context;
    private readonly ILogger<FamilyMemberService> _logger = logger;
    private readonly IPersonFactory _personFactory = personFactory;
    private readonly IHtmlSanitizerService _htmlSanitizerService = htmlSanitizerService;

    public async Task<(bool Success, Person? Person, string? Error)> AddPersonToTreeAsync(
        int treeId,
        int userId,
        CreatePersonDto dto)
    {
        // Validate at least one name is provided
        var nameValidationError = ValidateAtLeastOneName(dto.FirstName, dto.LastName);
        if (!string.IsNullOrEmpty(nameValidationError))
            return (false, null, nameValidationError);

        var normalizedCreateGender = NormalizeGenderOrNull(dto.Gender, out var createGenderError);
        if (!string.IsNullOrEmpty(createGenderError))
            return (false, null, createGenderError);

        dto.Gender = normalizedCreateGender;

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

    public async Task<(bool Success, PersonDto? Person, string? Error)> UpdatePersonAsync(
        int treeId,
        int personId,
        int userId,
        JsonElement patch)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null) return (false, null, ServiceErrors.FamilyTreeNotFound);

        var treeMember = await _context.TreeMembers.FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);
        if (treeMember == null) return (false, null, ServiceErrors.PersonNotFoundInTree);

        var person = await _context.People.FindAsync(personId);
        if (person == null) return (false, null, ServiceErrors.PersonNotFound);

        if (patch.TryGetProperty("firstName", out var firstNameProp))
            person.FirstName = firstNameProp.ValueKind == JsonValueKind.Null ? string.Empty : (firstNameProp.GetString()?.Trim() ?? string.Empty);

        if (patch.TryGetProperty("middleName", out var middleNameProp))
            person.MiddleName = middleNameProp.ValueKind == JsonValueKind.Null ? null : middleNameProp.GetString()?.Trim();

        if (patch.TryGetProperty("lastName", out var lastNameProp))
            person.LastName = lastNameProp.ValueKind == JsonValueKind.Null ? string.Empty : (lastNameProp.GetString()?.Trim() ?? string.Empty);

        if (patch.TryGetProperty("maidenName", out var maidenNameProp))
            person.MaidenName = maidenNameProp.ValueKind == JsonValueKind.Null ? null : maidenNameProp.GetString()?.Trim();

        if (patch.TryGetProperty("birthPlace", out var birthPlaceProp))
            person.BirthPlace = birthPlaceProp.ValueKind == JsonValueKind.Null ? null : birthPlaceProp.GetString()?.Trim();

        if (patch.TryGetProperty("deathPlace", out var deathPlaceProp))
            person.DeathPlace = deathPlaceProp.ValueKind == JsonValueKind.Null ? null : deathPlaceProp.GetString()?.Trim();

        if (patch.TryGetProperty("gender", out var genderProp))
        {
            if (genderProp.ValueKind == JsonValueKind.Null)
            {
                person.Gender = null;
            }
            else
            {
                var normalizedGender = NormalizeGenderOrNull(genderProp.GetString(), out var genderError);
                if (!string.IsNullOrEmpty(genderError))
                    return (false, null, genderError);

                person.Gender = normalizedGender;
            }
        }

        if (patch.TryGetProperty("biography", out var bioProp))
            person.Biography = bioProp.ValueKind == JsonValueKind.Null ? null : _htmlSanitizerService.Sanitize(bioProp.GetString() ?? string.Empty);

        if (patch.TryGetProperty("birthDate", out var birthDateProp))
            person.BirthDate = birthDateProp.ValueKind == JsonValueKind.Null ? null : DateOnly.Parse(birthDateProp.GetString()!);

        if (patch.TryGetProperty("deathDate", out var deathDateProp))
            person.DeathDate = deathDateProp.ValueKind == JsonValueKind.Null ? null : DateOnly.Parse(deathDateProp.GetString()!);

        var nameValidationError = ValidateAtLeastOneName(person.FirstName, person.LastName);
        if (!string.IsNullOrEmpty(nameValidationError))
            return (false, null, nameValidationError);

        if (person.DeathDate.HasValue && person.BirthDate.HasValue && person.DeathDate < person.BirthDate)
            return (false, null, ServiceErrors.DeathBeforeBirth);

        await _context.SaveChangesAsync();
        LogPersonUpdated(userId, personId, treeId);

        return (true, MapToPersonDto(person), null);
    }

    private static string? ValidateAtLeastOneName(string? firstName, string? lastName)
    {
        var hasFirstName = !string.IsNullOrWhiteSpace(firstName);
        var hasLastName = !string.IsNullOrWhiteSpace(lastName);

        if (!hasFirstName && !hasLastName)
            return "At least one of FirstName or LastName must be provided.";

        return null;
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

    private static string? NormalizeGenderOrNull(string? gender, out string? error)
    {
        if (string.IsNullOrWhiteSpace(gender))
        {
            error = null;
            return null;
        }

        if (Enum.TryParse<Gender>(gender.Trim(), ignoreCase: true, out var parsedGender))
        {
            error = null;
            return parsedGender.ToString();
        }

        error = ServiceErrors.InvalidGender;
        return null;
    }
}