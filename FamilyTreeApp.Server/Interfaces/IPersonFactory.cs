using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Models;

namespace FamilyTreeApp.Server.Interfaces;

public interface IPersonFactory
{
    Person Create(CreatePersonDto dto);
    void ApplyUpdate(Person person, UpdatePersonDto dto);
}