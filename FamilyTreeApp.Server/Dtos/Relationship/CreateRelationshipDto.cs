using System.ComponentModel.DataAnnotations;

namespace FamilyTreeApp.Server.Dtos.Relationship;

public class CreateRelationshipDto
{
    [Required]
    public int ParentId { get; set; }

    [Required]
    public int ChildId { get; set; }

    [Required]
    [RegularExpression("^(Biological|Adopted|Step|Foster)$")]
    public required string Type { get; set; } = "Biological";
}