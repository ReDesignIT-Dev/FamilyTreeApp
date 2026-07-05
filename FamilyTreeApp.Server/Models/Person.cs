namespace FamilyTreeApp.Server.Models;

public class Person
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? MaidenName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public string? BirthPlace { get; set; }
    public DateOnly? DeathDate { get; set; }
    public string? DeathPlace { get; set; }
    public string? Gender { get; set; } // "Male", "Female", "Other"
    public string? Biography { get; set; } // Rich text
    public string? ProfilePhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Relationship> ParentRelationships { get; set; } = [];
    public ICollection<Relationship> ChildRelationships { get; set; } = [];
    public ICollection<Media> MediaFiles { get; set; } = [];
}