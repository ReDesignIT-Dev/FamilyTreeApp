using FamilyTreeApp.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Tests.Helpers;

public static class TestDbContextFactory
{
    public static FamilyTreeContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new FamilyTreeContext(options);
    }
    public static FamilyTreeContext CreateInMemoryDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase(databaseName: databaseName)
            .Options;

        return new FamilyTreeContext(options);
    }
}