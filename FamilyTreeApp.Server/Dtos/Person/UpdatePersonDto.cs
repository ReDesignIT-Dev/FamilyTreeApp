namespace FamilyTreeApp.Server.Dtos.Person;

public class UpdatePersonDto
{
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? MaidenName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public string? BirthPlace { get; set; }
    public DateOnly? DeathDate { get; set; }
    public string? DeathPlace { get; set; }
    public string? Gender { get; set; }
    public string? Biography { get; set; }
}