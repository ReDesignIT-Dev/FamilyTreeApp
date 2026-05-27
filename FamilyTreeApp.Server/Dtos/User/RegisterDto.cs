using System.ComponentModel.DataAnnotations;
using FamilyTreeApp.Server.Models.Enums;

namespace FamilyTreeApp.Server.Dtos.User;

public class RegisterDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string PasswordConfirm { get; set; }
    public required string RecaptchaToken { get; set; }

    [Required, MaxLength(100)]
    public required string FirstName { get; set; }

    [Required, MaxLength(100)]
    public required string LastName { get; set; }

    [Required, EnumDataType(typeof(Gender))]
    public Gender Gender { get; set; }

    [Required]
    public DateOnly DateOfBirth { get; set; }
}
