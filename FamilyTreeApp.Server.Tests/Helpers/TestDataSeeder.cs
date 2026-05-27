using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.User;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Models.Enums;

namespace FamilyTreeApp.Server.Tests.Helpers;

public static class TestDataSeeder
{
    public static User CreateTestUser(int id = 1, string firstName = "firstName ", string lastName = "LastName", string email = "test@example.com")
    {
        return new User
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            DateOfBirth = new DateOnly(1990, 1, 1),
            Email = email
        };
    }

    public static RegisterDto CreateRegisterDtoFromUser(User user, Gender gender = Gender.Male)
    {
        return new RegisterDto
        {
            Email = user.Email ?? "test@example.com",
            Password = "Test@1234",
            PasswordConfirm = "Test@1234",      
            RecaptchaToken = "test-token",
            FirstName = user.FirstName,
            LastName = user.LastName,
            Gender = gender,
            DateOfBirth = user.DateOfBirth
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

    public static TreeMember CreateTestTreeMember(int treeId, int personId)
    {
        return new TreeMember
        {
            FamilyTreeId = treeId,
            PersonId = personId
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
}