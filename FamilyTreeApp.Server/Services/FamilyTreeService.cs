using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.FamilyTree;
using FamilyTreeApp.Server.Dtos.User;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Services;

public partial class FamilyTreeService(
    FamilyTreeContext context,
    ILogger<FamilyTreeService> logger) : IFamilyTreeService
{
    private readonly FamilyTreeContext _context = context;
    private readonly ILogger<FamilyTreeService> _logger = logger;

    public async Task CreateDefaultTreeAsync(int userId, RegisterDto dto)
    {
        var person = new Person
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Gender = dto.Gender,
            BirthDate = dto.DateOfBirth,
            CreatedAt = DateTime.UtcNow
        };
        _context.People.Add(person);
        await _context.SaveChangesAsync();

        var tree = new FamilyTree
        {
            Name = $"{dto.FirstName} {dto.LastName}'s Family Tree",
            OwnerId = userId,
            OwnerPersonId = person.Id,
            CreatedAt = DateTime.UtcNow
        };
        _context.FamilyTrees.Add(tree);
        await _context.SaveChangesAsync();

        _context.TreeMembers.Add(new TreeMember { FamilyTreeId = tree.Id, PersonId = person.Id });
        await _context.SaveChangesAsync();

        LogDefaultTreeCreated(userId);
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

        LogUserTreeUpdated(userId);

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