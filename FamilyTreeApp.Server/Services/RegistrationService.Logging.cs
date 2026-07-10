namespace FamilyTreeApp.Server.Services;

public partial class RegistrationService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} registered successfully")]
    private partial void LogUserRegistered(int userId);
}
