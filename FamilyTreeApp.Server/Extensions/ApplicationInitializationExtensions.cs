using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Extensions;

public static class ApplicationInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(this IServiceProvider serviceProvider, IConfiguration configuration)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<FamilyTreeContext>();
        await db.Database.MigrateAsync();

        await InitializeRolesAsync(scope.ServiceProvider);
        await InitializeAdminUserAsync(scope.ServiceProvider, configuration);
    }

    private static async Task InitializeRolesAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
        string[] roles = { "Admin", "User", "Moderator" };
        
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<int>(role));
            }
        }
    }

    private static async Task InitializeAdminUserAsync(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        var adminEmail = configuration["ADMIN_EMAIL"] ?? "";
        var adminPassword = configuration["ADMIN_PASSWORD"] ?? "";
        
        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            throw new InvalidOperationException("Admin email and password must be set in environment variables or appsettings.");
        }
        
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                IsActive = true,
                FirstName = "Admin",
                LastName = "User",
                Gender = Gender.Male,
                DateOfBirth = new DateOnly(1990, 1, 1)
            };
            
            var result = await userManager.CreateAsync(adminUser, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}
