using FamilyTreeApp.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace FamilyTreeApp.Server.Data;

public class FamilyTreeContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public FamilyTreeContext(DbContextOptions<FamilyTreeContext> options) : base(options) { }

   
    public DbSet<UserSession> UserSessions => Set<UserSession>();
   

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // Important: call base!
       

    }
}
