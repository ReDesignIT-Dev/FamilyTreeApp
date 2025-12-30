namespace FamilyTreeApp.Server.Models;

public class Person
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public required string LastName { get; set; }
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
    public ICollection<Relationship> ParentRelationships { get; set; } = new List<Relationship>();
    public ICollection<Relationship> ChildRelationships { get; set; } = new List<Relationship>();
    public ICollection<Media> MediaFiles { get; set; } = new List<Media>();
    public ICollection<TreeMember> Trees { get; set; } = new List<TreeMember>();
}