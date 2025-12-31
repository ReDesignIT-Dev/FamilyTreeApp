using FamilyTreeApp.Server.Authorization;
using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

DotNetEnv.Env.Load();

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Infrastructure", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Migrations", Serilog.Events.LogEventLevel.Warning)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
//builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<FamilyTreeContext>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddHttpClient(); // For RecaptchaService
builder.Services.AddScoped<RecaptchaService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();
builder.Services.AddScoped<IAuthorizationHandler, AdminHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ActiveUserHandler>();
builder.Services.AddScoped<IHtmlSanitizerService, HtmlSanitizerService>();
builder.Services.AddScoped<IMediaService, MediaService>(); 
builder.Services.AddScoped<IFamilyMemberService, FamilyMemberService>();
builder.Services.AddScoped<IFamilyTreeService, FamilyTreeService>();

// Configure Identity BEFORE authentication
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    options.SignIn.RequireConfirmedEmail = true;
    options.Password.RequiredLength = 12;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireDigit = true;
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";

    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<FamilyTreeContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    // Override the defaults set by AddIdentity
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrEmpty(jwtKey))
    {
        throw new InvalidOperationException("Jwt:Key is not configured in the application settings.");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ActiveUserOnly", policy =>
    {
        policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
        policy.Requirements.Add(new ActiveUserRequirement());
    });
    options.AddPolicy("AdminOnly", policy =>
    {
        policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
        policy.Requirements.Add(new AdminRequirement());
    });
    options.AddPolicy("AdminAndActive", policy =>
    {
        policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
        policy.Requirements.Add(new AdminRequirement());
        policy.Requirements.Add(new ActiveUserRequirement());
    });
});

// Enhanced CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(corsBuilder =>
    {
        corsBuilder
            .WithOrigins(
                "http://localhost:52177",
                "https://localhost:52177",
                "http://localhost:7068",
                "https://localhost:7068",
                "https://redesignit.pl",
                "http://redesignit.pl",
                "https://api-familytree.redesignit.pl",
                "http://api-familytree.redesignit.pl"
            )
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var dbType = builder.Configuration["DEV_DB"] ?? "sqlite";

if (dbType.ToLower() == "postgres")
{
    var host = builder.Configuration["POSTGRES_HOST"];
    var database = builder.Configuration["POSTGRES_DB"];
    var username = builder.Configuration["POSTGRES_USER"];
    var password = builder.Configuration["POSTGRES_PASSWORD"];
    var port = builder.Configuration["POSTGRES_PORT"] ?? "5432"; // Port is OK as default

    // Validate all required values are present
    if (string.IsNullOrEmpty(host))
        throw new InvalidOperationException("POSTGRES_HOST is required when using PostgreSQL");
    if (string.IsNullOrEmpty(database))
        throw new InvalidOperationException("POSTGRES_DB is required when using PostgreSQL");
    if (string.IsNullOrEmpty(username))
        throw new InvalidOperationException("POSTGRES_USER is required when using PostgreSQL");
    if (string.IsNullOrEmpty(password))
        throw new InvalidOperationException("POSTGRES_PASSWORD is required when using PostgreSQL");

    var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";
    builder.Services.AddDbContext<FamilyTreeContext>(opt => opt.UseNpgsql(connectionString));
}
else if (dbType.ToLower() == "sqlite")
{
    var connectionString = builder.Configuration.GetConnectionString("SQLiteConnection");
    builder.Services.AddDbContext<FamilyTreeContext>(opt => opt.UseSqlite(connectionString));
}
else
{
    throw new InvalidOperationException("Unsupported DEV_DB type. Use 'sqlite' or 'postgres'.");
}

// Configure Data Protection for production - MOVE THIS BEFORE builder.Build()
if (builder.Environment.IsProduction())
{
    var keysPath = builder.Configuration["Keys_Path"];
    if (string.IsNullOrEmpty(keysPath))
        throw new InvalidOperationException("Keys_Path is required");

    builder.Services.AddDataProtection()
        .SetApplicationName("FamilyTreeAPI")
        .PersistKeysToFileSystem(new DirectoryInfo(keysPath))
        .SetDefaultKeyLifetime(TimeSpan.FromDays(90));
}

var app = builder.Build();
app.UseCors();
app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FamilyTreeContext>();
    db.Database.Migrate();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
    string[] roles = ["Admin", "User", "Moderator"];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<int>(role));
        }
    }

    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var adminEmail = config["ADMIN_EMAIL"] ?? "";
    var adminPassword = config["ADMIN_PASSWORD"] ?? "";
    if (adminEmail == "" || adminPassword == "")
    {
        throw new Exception("Admin email and password must be set in environment variables or appsettings.");
    }
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new User
        {
            UserName = "admin",
            Email = adminEmail,
            EmailConfirmed = true,
            IsActive = true
        };
        var result = await userManager.CreateAsync(adminUser, adminPassword);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
