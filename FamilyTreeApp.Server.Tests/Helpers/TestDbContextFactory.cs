using FamilyTreeApp.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Tests.Helpers;

public static class TestDbContextFactory
{
    /// <summary>
    /// Creates an in-memory database context for testing.
    /// Each context has a unique database name to ensure test isolation.
    /// </summary>
    public static FamilyTreeContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new FamilyTreeContext(options);
    }

    /// <summary>
    /// Creates an in-memory database context with a specific database name.
    /// Use this when you need to share the same database across multiple contexts in a test.
    /// </summary>
    public static FamilyTreeContext CreateInMemoryDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase(databaseName: databaseName)
            .Options;

        return new FamilyTreeContext(options);
    }
}