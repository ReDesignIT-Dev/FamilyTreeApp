using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Services;

public class FamilyTreeService : IFamilyTreeService
{
    private readonly FamilyTreeContext _context;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<FamilyTreeService> _logger;

    public FamilyTreeService(
        FamilyTreeContext context,
        UserManager<User> userManager,
        ILogger<FamilyTreeService> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task CreateDefaultTreeAsync(int userId, string username)
    {
        _context.FamilyTrees.Add(new FamilyTree
        {
            Name = $"{username}'s Family Tree",
            OwnerId = userId,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        _logger.LogInformation("Default family tree created for user {UserId}", userId);
    }

    public async Task<(bool Success, FamilyTreeDto? Tree, string? Error)> GetUserTreeAsync(int userId)
    {
        var tree = await _context.FamilyTrees
            .AsNoTracking()
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.OwnerId == userId);

        if (tree == null)
            return (false, null, "Family tree not found");

        return (true, MapToDto(tree), null);
    }

    public async Task<(bool Success, FamilyTreeDto? Tree, string? Error)> UpdateTreeAsync(
        int userId,
        UpdateTreeDto dto)
    {
        var tree = await _context.FamilyTrees
            .FirstOrDefaultAsync(t => t.OwnerId == userId);

        if (tree == null)
            return (false, null, "Family tree not found");

        tree.Name = dto.Name;
        tree.Description = dto.Description;
        tree.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated their family tree", userId);

        return (true, MapToDto(tree), null);
    }

    private static FamilyTreeDto MapToDto(FamilyTree tree) => new()
    {
        Id = tree.Id,
        Name = tree.Name,
        Description = tree.Description,
        CreatedAt = tree.CreatedAt,
        UpdatedAt = tree.UpdatedAt,
        MemberCount = tree.Members?.Count ?? 0
    };
}