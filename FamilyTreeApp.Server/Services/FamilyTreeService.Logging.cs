namespace FamilyTreeApp.Server.Services;

public partial class FamilyTreeService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Default family tree created for user {UserId}")]
    private partial void LogDefaultTreeCreated(int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} updated their family tree")]
    private partial void LogUserTreeUpdated(int userId);
}
