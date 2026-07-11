using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Models.Enums;

namespace FamilyTreeApp.Server.Factories;

public class PersonFactory(IHtmlSanitizerService htmlSanitizer) : IPersonFactory
{
    private readonly IHtmlSanitizerService _htmlSanitizer = htmlSanitizer;

    public Person Create(CreatePersonDto dto)
    {
        return new Person
        {
            FirstName = dto.FirstName?.Trim() ?? string.Empty,
            MiddleName = dto.MiddleName?.Trim(),
            LastName = dto.LastName?.Trim() ?? string.Empty,
            MaidenName = dto.MaidenName?.Trim(),
            BirthDate = dto.BirthDate,
            BirthPlace = dto.BirthPlace?.Trim(),
            DeathDate = dto.DeathDate,
            DeathPlace = dto.DeathPlace?.Trim(),
            Gender = dto.Gender,
            Biography = !string.IsNullOrWhiteSpace(dto.Biography)
                ? _htmlSanitizer.Sanitize(dto.Biography)
                : null,
            CreatedAt = DateTime.UtcNow
        };
    }
}