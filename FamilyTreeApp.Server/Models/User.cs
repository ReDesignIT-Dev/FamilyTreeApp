using Microsoft.AspNetCore.Identity;
using FamilyTreeApp.Server.Models.Enums;

namespace FamilyTreeApp.Server.Models;

public class User : IdentityUser<int>
{
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public Gender Gender { get; set; }
    public required DateOnly DateOfBirth { get; set; }
}

