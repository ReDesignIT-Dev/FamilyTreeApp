using Microsoft.AspNetCore.Identity;

namespace FamilyTreeApp.Server.Models;

public class User : IdentityUser<int>
{
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

