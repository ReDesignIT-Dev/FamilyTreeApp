using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;

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
            Gender = dto.Gender?.Trim(),
            Biography = !string.IsNullOrWhiteSpace(dto.Biography)
                ? _htmlSanitizer.Sanitize(dto.Biography)
                : null,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void ApplyUpdate(Person person, UpdatePersonDto dto)
    {
        person.FirstName = dto.FirstName?.Trim() ?? string.Empty;
        person.MiddleName = dto.MiddleName?.Trim();
        person.LastName = dto.LastName?.Trim() ?? string.Empty;
        person.MaidenName = dto.MaidenName?.Trim();
        person.BirthDate = dto.BirthDate;
        person.BirthPlace = dto.BirthPlace?.Trim();
        person.DeathDate = dto.DeathDate;
        person.DeathPlace = dto.DeathPlace?.Trim();
        person.Gender = dto.Gender?.Trim();
        person.Biography = !string.IsNullOrWhiteSpace(dto.Biography)
            ? _htmlSanitizer.Sanitize(dto.Biography)
            : null;
    }
}