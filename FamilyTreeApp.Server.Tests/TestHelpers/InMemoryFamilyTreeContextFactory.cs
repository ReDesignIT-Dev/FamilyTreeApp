using FamilyTreeApp.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Tests.TestHelpers;

public static class InMemoryFamilyTreeContextFactory
{
    public static FamilyTreeContext Create(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        return new FamilyTreeContext(options);
    }
}
