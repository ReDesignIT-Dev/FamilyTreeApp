using System.ComponentModel.DataAnnotations;

namespace FamilyTreeApp.Server.Dtos.FamilyTree;

public class CreateTreeDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public required string Name { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    public bool IsPublic { get; set; } = false;
}