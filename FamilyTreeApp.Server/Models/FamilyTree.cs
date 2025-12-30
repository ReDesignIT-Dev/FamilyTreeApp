namespace FamilyTreeApp.Server.Models;

public class FamilyTree
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public User Owner { get; set; } = default!;
    public bool IsPublic { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<TreeMember> Members { get; set; } = new List<TreeMember>();
    public ICollection<TreeCollaborator> Collaborators { get; set; } = new List<TreeCollaborator>();
}