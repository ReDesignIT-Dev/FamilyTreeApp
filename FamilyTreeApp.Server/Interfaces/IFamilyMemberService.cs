using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Models;

namespace FamilyTreeApp.Server.Interfaces;

public interface IFamilyMemberService
{
    Task<(bool Success, Person? Person, string? Error)> AddPersonToTreeAsync(int treeId, int userId, CreatePersonDto dto);
    Task<(bool Success, List<PersonSummaryDto>? Members, string? Error)> GetTreeMembersAsync(int treeId, int userId);
    Task<(bool Success, PersonDto? Person, string? Error)> GetPersonByIdAsync(int treeId, int personId, int userId);
    Task<(bool Success, PersonDto? Person, string? Error)> UpdatePersonAsync(int treeId, int personId, int userId, UpdatePersonDto dto);
    Task<(bool Success, string? Error)> RemovePersonFromTreeAsync(int treeId, int personId, int userId);
    Task<bool> HasAccessToTreeAsync(int treeId, int userId);
    Task<bool> CanEditTreeAsync(int treeId, int userId);
}