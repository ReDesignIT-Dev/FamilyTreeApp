using Npgsql;

namespace FamilyTreeApp.DbSetup;

public class Program
{
    public static async Task Main(string[] args)
    {
        // Load .env file from Server project
        var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "FamilyTreeApp.Server", ".env");
        DotNetEnv.Env.Load(envPath);

        var adminUser = Environment.GetEnvironmentVariable("ADMIN_POSTGRESQL") ?? "postgres";
        var adminPassword = Environment.GetEnvironmentVariable("ADMIN_POSTGRESQL_PASSWORD");
        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
        var dbName = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "familytreedb";
        var dbUser = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "familytreeuser";
        var dbPassword = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");

        if (string.IsNullOrEmpty(adminPassword) || string.IsNullOrEmpty(dbPassword))
        {
            Console.WriteLine("ERROR: Missing required environment variables");
            return;
        }

        // Connection string to postgres database (default)
        var adminConnString = $"Host={host};Database=postgres;Username={adminUser};Password={adminPassword}";

        try
        {
            await using var conn = new NpgsqlConnection(adminConnString);
            await conn.OpenAsync();
            Console.WriteLine("✓ Connected to PostgreSQL as admin");

            // Check if user exists
            var userExists = await CheckUserExists(conn, dbUser);
            if (!userExists)
            {
                await ExecuteCommand(conn, $"CREATE USER {dbUser} WITH PASSWORD '{dbPassword}'");
                Console.WriteLine($"✓ Created user: {dbUser}");
            }
            else
            {
                Console.WriteLine($"✓ User already exists: {dbUser}");
            }

            // Check if database exists
            var dbExists = await CheckDatabaseExists(conn, dbName);
            if (!dbExists)
            {
                await ExecuteCommand(conn, $"CREATE DATABASE {dbName} OWNER {dbUser}");
                Console.WriteLine($"✓ Created database: {dbName}");
            }
            else
            {
                Console.WriteLine($"✓ Database already exists: {dbName}");
            }

            // Grant privileges on database
            await ExecuteCommand(conn, $"GRANT ALL PRIVILEGES ON DATABASE {dbName} TO {dbUser}");
            Console.WriteLine($"✓ Granted database privileges to {dbUser}");

            // Connect to the new database to set schema permissions
            await conn.CloseAsync();
            var dbConnString = $"Host={host};Database={dbName};Username={adminUser};Password={adminPassword}";
            await using var dbConn = new NpgsqlConnection(dbConnString);
            await dbConn.OpenAsync();
            Console.WriteLine($"✓ Connected to database: {dbName}");

            // Grant schema permissions
            await ExecuteCommand(dbConn, $"GRANT ALL ON SCHEMA public TO {dbUser}");
            await ExecuteCommand(dbConn, $"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {dbUser}");
            await ExecuteCommand(dbConn, $"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {dbUser}");
            Console.WriteLine("✓ Granted schema permissions");

            // Set default privileges
            await ExecuteCommand(dbConn, $"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {dbUser}");
            await ExecuteCommand(dbConn, $"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {dbUser}");
            Console.WriteLine("✓ Set default privileges for future objects");

            Console.WriteLine("\n✅ Database setup completed successfully!");
            Console.WriteLine($"\nConnection string for your app:");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\n❌ ERROR: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"   Inner: {ex.InnerException.Message}");
            }
        }
    }

    private static async Task ExecuteCommand(NpgsqlConnection conn, string sql)
    {
        await using var cmd = new NpgsqlCommand(sql, conn);
        await cmd.ExecuteNonQueryAsync();
    }

    private static async Task<bool> CheckUserExists(NpgsqlConnection conn, string username)
    {
        var sql = "SELECT 1 FROM pg_roles WHERE rolname = @username";
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("username", username);
        var result = await cmd.ExecuteScalarAsync();
        return result != null;
    }

    private static async Task<bool> CheckDatabaseExists(NpgsqlConnection conn, string dbName)
    {
        var sql = "SELECT 1 FROM pg_database WHERE datname = @dbname";
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("dbname", dbName);
        var result = await cmd.ExecuteScalarAsync();
        return result != null;
    }
}
