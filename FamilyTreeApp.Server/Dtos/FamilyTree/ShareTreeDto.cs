using System.ComponentModel.DataAnnotations;

namespace FamilyTreeApp.Server.Dtos.FamilyTree;

public class ShareTreeDto
{
    [Required]
    [EmailAddress]
    public required string UserEmail { get; set; }

    [Required]
    [RegularExpression("^(View|Edit|Admin)$")]
    public required string Permission { get; set; } // "View", "Edit", "Admin"
}