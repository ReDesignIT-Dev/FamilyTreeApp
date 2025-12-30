namespace FamilyTreeApp.Server.Dtos.Media;

public class MediaDto
{
    public int Id { get; set; }
    public int PersonId { get; set; }
    public required string FileName { get; set; }
    public required string FilePath { get; set; }
    public string? Caption { get; set; }
    public required string MediaType { get; set; }
    public DateTime UploadedAt { get; set; }
}