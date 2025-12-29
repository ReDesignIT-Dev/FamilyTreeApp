using FamilyTreeApp.Server.Models;

namespace FamilyTreeApp.Server.Interfaces;

public interface ITokenService
{
    string CreateToken(User user, string sessionId, DateTime expiresAt, IEnumerable<string> roles);
}
