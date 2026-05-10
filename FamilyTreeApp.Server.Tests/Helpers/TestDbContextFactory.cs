using FamilyTreeApp.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace FamilyTreeApp.Server.Tests.Helpers;

public static class TestDbContextFactory
{
    public static FamilyTreeContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new FamilyTreeContext(options);
    }

    public static FamilyTreeContext CreateInMemoryDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase(databaseName: databaseName)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new FamilyTreeContext(options);
    }
}