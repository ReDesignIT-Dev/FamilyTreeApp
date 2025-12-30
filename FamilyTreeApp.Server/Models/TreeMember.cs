namespace FamilyTreeApp.Server.Models;

public class TreeMember
{
    public int FamilyTreeId { get; set; }
    public FamilyTree FamilyTree { get; set; } = default!;
    public int PersonId { get; set; }
    public Person Person { get; set; } = default!;
}