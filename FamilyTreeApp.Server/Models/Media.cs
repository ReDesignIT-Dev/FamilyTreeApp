namespace FamilyTreeApp.Server.Models;

public class Media
{
    public int Id { get; set; }
    public int PersonId { get; set; }
    public Person Person { get; set; } = default!;
    public required string FileName { get; set; }
    public required string FilePath { get; set; }
    public string? Caption { get; set; }
    public string MediaType { get; set; } = "Photo"; // "Photo", "Document", "Video"
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}