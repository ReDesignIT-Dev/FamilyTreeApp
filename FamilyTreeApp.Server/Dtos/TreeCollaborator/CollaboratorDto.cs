namespace FamilyTreeApp.Server.Dtos.TreeCollaborator;

public class CollaboratorDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Permission { get; set; }
    public DateTime InvitedAt { get; set; }
}