namespace FamilyTreeApp.Server.Services;

public partial class FamilyMemberService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} added person {PersonId} to tree {TreeId}")]
    private partial void LogPersonAddedToTree(int userId, int personId, int treeId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} updated person {PersonId} in tree {TreeId}")]
    private partial void LogPersonUpdated(int userId, int personId, int treeId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} removed person {PersonId} from tree {TreeId}")]
    private partial void LogPersonRemovedFromTree(int userId, int personId, int treeId);
}