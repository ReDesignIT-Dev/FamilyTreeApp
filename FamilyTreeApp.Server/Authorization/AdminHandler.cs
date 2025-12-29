using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using FamilyTreeApp.Server.Models;
using System.Security.Claims;

namespace FamilyTreeApp.Server.Authorization;

public class AdminHandler : AuthorizationHandler<AdminRequirement>
{
    private readonly UserManager<User> _userManager;

    public AdminHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, AdminRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return;

        var user = await _userManager.FindByIdAsync(userId);
        if (user != null)
        {
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Contains("Admin"))
            {
                context.Succeed(requirement);
            }
        }
    }
}
