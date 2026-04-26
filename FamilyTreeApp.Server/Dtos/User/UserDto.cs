namespace FamilyTreeApp.Server.Dtos.User;

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
}
