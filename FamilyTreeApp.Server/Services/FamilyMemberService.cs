using FamilyTreeApp.Server.Constants;
using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
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
        var validationError = ValidateCreatePersonDto(dto);
        if (validationError != null)
            return (false, null, validationError);

        var (treeSuccess, _, treeError) = await GetTreeForEditAsync(treeId, userId);
        if (!treeSuccess)
            return (false, null, treeError);

        var person = _personFactory.Create(dto);
        await PersistPersonAndTreeMemberAsync(person, treeId);

        LogPersonAddedToTree(userId, person.Id, treeId);
        return (true, person, null);
    }

    private static string? ValidateCreatePersonDto(CreatePersonDto dto)
    {
        var nameError = ValidateAtLeastOneName(dto.FirstName, dto.LastName);
        if (nameError != null)
            return nameError;

        if (dto.DeathDate.HasValue && dto.BirthDate.HasValue && dto.DeathDate < dto.BirthDate)
            return ServiceErrors.DeathBeforeBirth;

        return null;
    }

    private async Task<(bool Success, FamilyTree? Tree, string? Error)> GetTreeForEditAsync(int treeId, int userId)
    {
        var tree = await _context.FamilyTrees.FindAsync(treeId);
        if (tree == null)
            return (false, null, ServiceErrors.FamilyTreeNotFound);

        if (tree.OwnerId != userId)
            return (false, null, ServiceErrors.NoEditPermission);

        return (true, tree, null);
    }

    private async Task PersistPersonAndTreeMemberAsync(Person person, int treeId)
    {
        var treeMember = new TreeMember
        {
            FamilyTreeId = treeId,
            Person = person
        };
        _context.TreeMembers.Add(treeMember);
        await _context.SaveChangesAsync();
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

        if (tree.OwnerId != userId)
            return (false, null, ServiceErrors.NoAccessPermission);

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

        if (tree.OwnerId != userId)
            return (false, null, ServiceErrors.NoAccessPermission);

        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);

        if (treeMember == null)
            return (false, null, ServiceErrors.PersonNotFoundInTree);

        var person = await _context.People
            .AsNoTracking()
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
        var (treeSuccess, tree, treeError) = await GetTreeForEditAsync(treeId, userId);
        if (!treeSuccess)
            return (false, treeError);

        if (tree!.OwnerPersonId == personId)
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
        var loadResult = await GetEditablePersonForUpdateAsync(treeId, personId, userId);
        if (!loadResult.Success)
            return (false, null, loadResult.Error);

        var person = loadResult.Person!;

        var patchError = ApplyPersonPatch(person, patch);
        if (!string.IsNullOrEmpty(patchError))
            return (false, null, patchError);

        var validationError = ValidatePersonAfterPatch(person);
        if (!string.IsNullOrEmpty(validationError))
            return (false, null, validationError);

        await _context.SaveChangesAsync();
        LogPersonUpdated(userId, personId, treeId);

        return (true, MapToPersonDto(person), null);
    }

    private async Task<(bool Success, Person? Person, string? Error)> GetEditablePersonForUpdateAsync(
        int treeId,
        int personId,
        int userId)
    {
        var (treeSuccess, _, treeError) = await GetTreeForEditAsync(treeId, userId);
        if (!treeSuccess)
            return (false, null, treeError);

        var treeMember = await _context.TreeMembers
            .FirstOrDefaultAsync(tm => tm.FamilyTreeId == treeId && tm.PersonId == personId);
        if (treeMember == null)
            return (false, null, ServiceErrors.PersonNotFoundInTree);

        var person = await _context.People.FindAsync(personId);
        if (person == null)
            return (false, null, ServiceErrors.PersonNotFound);

        return (true, person, null);
    }

    private string? ApplyPersonPatch(Person person, JsonElement patch)
    {
        ApplyRequiredStringPatch(patch, "firstName", value => person.FirstName = value ?? string.Empty);
        ApplyOptionalStringPatch(patch, "middleName", value => person.MiddleName = value);
        ApplyRequiredStringPatch(patch, "lastName", value => person.LastName = value ?? string.Empty);
        ApplyOptionalStringPatch(patch, "maidenName", value => person.MaidenName = value);
        ApplyOptionalStringPatch(patch, "birthPlace", value => person.BirthPlace = value);
        ApplyOptionalStringPatch(patch, "deathPlace", value => person.DeathPlace = value);

        ApplyGenderPatch(patch, person);

        ApplyBiographyPatch(patch, person);
        ApplyDatePatch(patch, "birthDate", value => person.BirthDate = value);
        ApplyDatePatch(patch, "deathDate", value => person.DeathDate = value);

        return null;
    }

    private static void ApplyGenderPatch(JsonElement patch, Person person)
    {
        if (!patch.TryGetProperty("gender", out var genderProp))
            return;

        if (genderProp.ValueKind == JsonValueKind.Null)
        {
            person.Gender = Gender.Male;
            return;
        }

        if (genderProp.ValueKind == JsonValueKind.String &&
            Enum.TryParse<Gender>(genderProp.GetString(), ignoreCase: true, out var parsed))
        {
            person.Gender = parsed;
            return;
        }

        if (genderProp.ValueKind == JsonValueKind.Number &&
            genderProp.TryGetInt32(out var numeric) &&
            Enum.IsDefined(typeof(Gender), numeric))
        {
            person.Gender = (Gender)numeric;
            return;
        }

        person.Gender = Gender.Male;
    }

    private static string? ValidatePersonAfterPatch(Person person)
    {
        var nameValidationError = ValidateAtLeastOneName(person.FirstName, person.LastName);
        if (!string.IsNullOrEmpty(nameValidationError))
            return nameValidationError;

        if (person.DeathDate.HasValue && person.BirthDate.HasValue && person.DeathDate < person.BirthDate)
            return ServiceErrors.DeathBeforeBirth;

        return null;
    }

    private static void ApplyRequiredStringPatch(JsonElement patch, string propertyName, Action<string?> assign)
    {
        if (!patch.TryGetProperty(propertyName, out var property))
            return;

        if (property.ValueKind == JsonValueKind.Null)
        {
            assign(null);
            return;
        }

        assign(property.GetString()?.Trim());
    }

    private static void ApplyOptionalStringPatch(JsonElement patch, string propertyName, Action<string?> assign)
    {
        if (!patch.TryGetProperty(propertyName, out var property))
            return;

        assign(property.ValueKind == JsonValueKind.Null ? null : property.GetString()?.Trim());
    }

    private void ApplyBiographyPatch(JsonElement patch, Person person)
    {
        if (!patch.TryGetProperty("biography", out var bioProp))
            return;

        person.Biography = bioProp.ValueKind == JsonValueKind.Null
            ? null
            : _htmlSanitizerService.Sanitize(bioProp.GetString() ?? string.Empty);
    }

    private static void ApplyDatePatch(JsonElement patch, string propertyName, Action<DateOnly?> assign)
    {
        if (!patch.TryGetProperty(propertyName, out var property))
            return;

        assign(property.ValueKind == JsonValueKind.Null ? null : DateOnly.Parse(property.GetString()!, CultureInfo.CurrentCulture));
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
}