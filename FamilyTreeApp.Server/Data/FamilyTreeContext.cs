using FamilyTreeApp.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using FamilyTreeApp.Server.Models.Enums;

namespace FamilyTreeApp.Server.Data;

public class FamilyTreeContext(DbContextOptions<FamilyTreeContext> options) : IdentityDbContext<User, IdentityRole<int>, int>(options)
{
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<FamilyTree> FamilyTrees => Set<FamilyTree>();
    public DbSet<Person> People => Set<Person>();
    public DbSet<Relationship> Relationships => Set<Relationship>();
    public DbSet<Media> MediaFiles => Set<Media>();
    public DbSet<TreeMember> TreeMembers => Set<TreeMember>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder
            .Properties<Gender>()
            .HaveConversion<string>();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<TreeMember>()
            .HasKey(tm => new { tm.FamilyTreeId, tm.PersonId });

        builder.Entity<Relationship>()
            .HasOne(r => r.Parent)
            .WithMany(p => p.ParentRelationships)
            .HasForeignKey(r => r.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Relationship>()
            .HasOne(r => r.Child)
            .WithMany(p => p.ChildRelationships)
            .HasForeignKey(r => r.ChildId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Person>()
            .Property(p => p.Gender)
            .HasDefaultValue(Gender.Male);
    }
}
