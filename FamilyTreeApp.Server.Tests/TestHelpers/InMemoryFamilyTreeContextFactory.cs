using FamilyTreeApp.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Tests.TestHelpers;

public static class InMemoryFamilyTreeContextFactory
{
    public static DbContextOptions<FamilyTreeContext> BuildOptions()
    {
        // Generate unique database name per call (per test)
        return new DbContextOptionsBuilder<FamilyTreeContext>()
            .UseInMemoryDatabase($"InMemoryTestDb_{Guid.NewGuid().ToString("N")}")
            .Options;
    }

    public static FamilyTreeContext Create() =>
        new FamilyTreeContext(BuildOptions());
}