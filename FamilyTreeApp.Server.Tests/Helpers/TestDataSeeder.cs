using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Models;

namespace FamilyTreeApp.Server.Tests.Helpers;

public static class TestDataSeeder
{
    public static User CreateTestUser(int id = 1, string userName = "testuser", string email = "test@example.com")
    {
        return new User
        {
            Id = id,
            UserName = userName,
            Email = email
        };
    }

    public static FamilyTree CreateTestFamilyTree(int id = 1, string name = "Test Tree", int ownerId = 1, User? owner = null)
    {
        return new FamilyTree
        {
            Id = id,
            Name = name,
            OwnerId = ownerId,
            Owner = owner ?? CreateTestUser(ownerId)
        };
    }

    public static TreeCollaborator CreateTestCollaborator(int treeId, int userId, string permission = "Edit")
    {
        return new TreeCollaborator
        {
            FamilyTreeId = treeId,
            UserId = userId,
            Permission = permission
        };
    }

    public static Person CreateTestPerson(
        int id = 1,
        string firstName = "John",
        string lastName = "Doe",
        DateOnly? birthDate = null,
        string? gender = "Male")
    {
        return new Person
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            BirthDate = birthDate,
            Gender = gender
        };
    }

    /// <summary>
    /// Seeds a basic test scenario: one owner with one family tree
    /// </summary>
    public static async Task<(User owner, FamilyTree tree)> SeedBasicScenarioAsync(FamilyTreeContext context)
    {
        var owner = CreateTestUser(1, "owner", "owner@test.com");
        var tree = CreateTestFamilyTree(1, "Test Tree", 1, owner);

        context.Users.Add(owner);
        context.FamilyTrees.Add(tree);
        await context.SaveChangesAsync();

        return (owner, tree);
    }

    /// <summary>
    /// Seeds a scenario with owner and collaborator
    /// </summary>
    public static async Task<(User owner, User collaborator, FamilyTree tree, TreeCollaborator collaboration)> 
        SeedCollaboratorScenarioAsync(FamilyTreeContext context, string permission = "Edit")
    {
        var owner = CreateTestUser(1, "owner", "owner@test.com");
        var collaborator = CreateTestUser(2, "collab", "collab@test.com");
        var tree = CreateTestFamilyTree(1, "Test Tree", 1, owner);
        var collaboration = CreateTestCollaborator(1, 2, permission);

        context.Users.AddRange(owner, collaborator);
        context.FamilyTrees.Add(tree);
        context.TreeCollaborators.Add(collaboration);
        await context.SaveChangesAsync();

        return (owner, collaborator, tree, collaboration);
    }
}