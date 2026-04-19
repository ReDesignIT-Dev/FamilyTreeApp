namespace FamilyTreeApp.Server.Dtos.User;

public class PasswordResetDto
{
    public required string Password { get; set; }
    public required string PasswordConfirm { get; set; }
    public string? RecaptchaToken { get; set; }
}