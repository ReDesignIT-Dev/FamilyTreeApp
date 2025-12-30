using System.ComponentModel.DataAnnotations;

namespace FamilyTreeApp.Server.Dtos.Person;

public class CreatePersonDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public required string FirstName { get; set; }

    [StringLength(100)]
    public string? MiddleName { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public required string LastName { get; set; }

    [StringLength(100)]
    public string? MaidenName { get; set; }

    public DateOnly? BirthDate { get; set; }

    [StringLength(200)]
    public string? BirthPlace { get; set; }

    public DateOnly? DeathDate { get; set; }

    [StringLength(200)]
    public string? DeathPlace { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(5000)]
    public string? Biography { get; set; }
}