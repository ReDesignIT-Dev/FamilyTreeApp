namespace FamilyTreeApp.Server.Dtos.Person;

public class PersonSummaryDto
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public DateOnly? DeathDate { get; set; }
    public string? ProfilePhotoUrl { get; set; }
}