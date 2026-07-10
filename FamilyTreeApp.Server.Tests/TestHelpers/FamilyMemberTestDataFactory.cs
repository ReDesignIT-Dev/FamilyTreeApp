using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Models.Enums;

namespace FamilyTreeApp.Server.Tests.TestHelpers;

public static class FamilyMemberTestDataFactory
{
    public static FamilyTree CreateFamilyTree(int id = 1, int ownerId = 1, string name = "Test Tree")
    {
        return new FamilyTree
        {
            Id = id,
            OwnerId = ownerId,
            Name = name
        };
    }

    public static CreatePersonDto CreateCreatePersonDto(
        string? firstName = "John",
        string? lastName = "Doe",
        Gender gender = Gender.Male)
    {
        return new CreatePersonDto
        {
            FirstName = firstName,
            LastName = lastName,
            Gender = gender
        };
    }

    public static Person CreatePersonEntity(
        string? firstName = "John",
        string? lastName = "Doe",
        Gender? gender = Gender.Male)
    {
        return new Person
        {
            FirstName = firstName ?? string.Empty,
            LastName = lastName ?? string.Empty,
            Gender = gender ?? Gender.Male
        };
    }
}
