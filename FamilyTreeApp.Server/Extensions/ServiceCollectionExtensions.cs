using FamilyTreeApp.Server.Authorization;
using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Factories;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace FamilyTreeApp.Server.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRegistrationService, RegistrationService>();
        services.AddHttpClient();
        services.AddScoped<RecaptchaService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IUserRoleService, UserRoleService>();
        services.AddScoped<IAuthorizationHandler, AdminHandler>();
        services.AddScoped<IAuthorizationHandler, ActiveUserHandler>();
        services.AddScoped<IHtmlSanitizerService, HtmlSanitizerService>();
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<IFamilyMemberService, FamilyMemberService>();
        services.AddScoped<IFamilyTreeService, FamilyTreeService>();
        services.AddScoped<IPersonFactory, PersonFactory>();

        return services;
    }

    public static IServiceCollection AddApplicationIdentity(this IServiceCollection services)
    {
        services.AddIdentity<User, IdentityRole<int>>(options =>
        {
            options.SignIn.RequireConfirmedEmail = true;
            options.Password.RequiredLength = 12;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireDigit = true;
            options.User.RequireUniqueEmail = true;
            options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.@+";

            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
        })
        .AddEntityFrameworkStores<FamilyTreeContext>()
        .AddDefaultTokenProviders();

        return services;
    }

    public static IServiceCollection AddApplicationAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            var jwtKey = configuration["Jwt:Key"];
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
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ClockSkew = TimeSpan.Zero
            };
        });

        return services;
    }

    public static IServiceCollection AddApplicationAuthorization(this IServiceCollection services)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy("ActiveUserOnly", policy =>
            {
                policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
                policy.Requirements.Add(new ActiveUserRequirement());
            })
            .AddPolicy("AdminOnly", policy =>
            {
                policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
                policy.Requirements.Add(new AdminRequirement());
            })
            .AddPolicy("AdminAndActive", policy =>
            {
                policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
                policy.Requirements.Add(new AdminRequirement());
                policy.Requirements.Add(new ActiveUserRequirement());
            });

        return services;
    }

    public static IServiceCollection AddApplicationCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(corsBuilder =>
            {
                corsBuilder
                    .WithOrigins(
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

        return services;
    }

    public static IServiceCollection AddApplicationDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var dbType = configuration["DEV_DB"];

        if (dbType != null && dbType.Equals("postgres", StringComparison.OrdinalIgnoreCase))
        {
            var host = configuration["POSTGRES_HOST"];
            var database = configuration["POSTGRES_DB"];
            var username = configuration["POSTGRES_USER"];
            var password = configuration["POSTGRES_PASSWORD"];
            var port = configuration["POSTGRES_PORT"] ?? "5432";

            if (string.IsNullOrEmpty(host))
                throw new InvalidOperationException("POSTGRES_HOST is required");
            if (string.IsNullOrEmpty(database))
                throw new InvalidOperationException("POSTGRES_DB is required");
            if (string.IsNullOrEmpty(username))
                throw new InvalidOperationException("POSTGRES_USER is required");
            if (string.IsNullOrEmpty(password))
                throw new InvalidOperationException("POSTGRES_PASSWORD is required");

            var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";
            services.AddDbContext<FamilyTreeContext>(opt => opt.UseNpgsql(connectionString));
        }
        else
        {
            throw new InvalidOperationException("Unsupported DEV_DB type. Accepted only 'postgres'.");
        }

        return services;
    }

    public static IServiceCollection AddApplicationDataProtection(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        if (environment.IsProduction())
        {
            var keysPath = configuration["Keys_Path"];
            if (string.IsNullOrEmpty(keysPath))
                throw new InvalidOperationException("Keys_Path is required");

            services.AddDataProtection()
                .SetApplicationName("FamilyTreeAPI")
                .PersistKeysToFileSystem(new DirectoryInfo(keysPath))
                .SetDefaultKeyLifetime(TimeSpan.FromDays(90));
        }

        return services;
    }
}
