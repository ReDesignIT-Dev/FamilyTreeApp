using FamilyTreeApp.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using FamilyTreeApp.Server.Models.Enums;

namespace FamilyTreeApp.Server.Data;

public class FamilyTreeContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public FamilyTreeContext(DbContextOptions<FamilyTreeContext> options) : base(options) { }

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TreeMember>()
            .HasKey(tm => new { tm.FamilyTreeId, tm.PersonId });

        modelBuilder.Entity<Relationship>()
            .HasOne(r => r.Parent)
            .WithMany(p => p.ParentRelationships)
            .HasForeignKey(r => r.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Relationship>()
            .HasOne(r => r.Child)
            .WithMany(p => p.ChildRelationships)
            .HasForeignKey(r => r.ChildId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
