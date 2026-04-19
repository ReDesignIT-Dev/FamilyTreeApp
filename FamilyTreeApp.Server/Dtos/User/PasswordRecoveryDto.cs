namespace FamilyTreeApp.Server.Dtos.User;

public class PasswordRecoveryDto
{
    public required string Email { get; set; }
    public string? RecaptchaToken { get; set; }
}