namespace FamilyTreeApp.Server.Models;

public class Relationship
{
    public int Id { get; set; }
    public int ParentId { get; set; }
    public Person Parent { get; set; } = default!;
    public int ChildId { get; set; }
    public Person Child { get; set; } = default!;
    public string Type { get; set; } = "Biological"; // "Biological", "Adopted", "Step", "Foster"
}