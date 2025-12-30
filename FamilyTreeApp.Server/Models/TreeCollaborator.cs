namespace FamilyTreeApp.Server.Models;

public class TreeCollaborator
{
    public int Id { get; set; }
    public int FamilyTreeId { get; set; }
    public FamilyTree FamilyTree { get; set; } = default!;
    public int UserId { get; set; }
    public User User { get; set; } = default!;
    public string Permission { get; set; } = "View"; // "View", "Edit", "Admin"
    public DateTime InvitedAt { get; set; } = DateTime.UtcNow;
}