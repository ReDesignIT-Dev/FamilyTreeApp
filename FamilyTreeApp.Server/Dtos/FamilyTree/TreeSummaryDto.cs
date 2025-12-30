namespace FamilyTreeApp.Server.Dtos.FamilyTree;

public class TreeSummaryDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
}