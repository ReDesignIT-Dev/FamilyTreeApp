namespace FamilyTreeApp.Server.Dtos.Relationship;

public class RelationshipDto
{
    public int Id { get; set; }
    public int ParentId { get; set; }
    public required string ParentName { get; set; }
    public int ChildId { get; set; }
    public required string ChildName { get; set; }
    public required string Type { get; set; }
}