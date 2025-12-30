using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FamilyTreeApp.Server.Dtos.Media;

public class UploadMediaDto
{
    [Required]
    public required IFormFile File { get; set; }

    [StringLength(500)]
    public string? Caption { get; set; }

    [Required]
    [RegularExpression("^(Photo|Document|Video)$")]
    public required string MediaType { get; set; } = "Photo";
}