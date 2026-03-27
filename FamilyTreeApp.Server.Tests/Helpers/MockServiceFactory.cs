using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Models;
using FamilyTreeApp.Server.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;

namespace FamilyTreeApp.Server.Tests.Helpers;

public static class MockServiceFactory
{
    public static Mock<IHtmlSanitizerService> CreateHtmlSanitizer(bool returnInputAsIs = true)
    {
        var mock = new Mock<IHtmlSanitizerService>();

        if (returnInputAsIs)
        {
            mock.Setup(x => x.Sanitize(It.IsAny<string>()))
                .Returns((string input) => input);
        }

        return mock;
    }

    public static Mock<ILogger<T>> CreateLogger<T>()
    {
        return new Mock<ILogger<T>>();
    }

    public static Mock<IPersonFactory> CreatePersonFactory()
    {
        var mock = new Mock<IPersonFactory>();

        mock.Setup(f => f.Create(It.IsAny<CreatePersonDto>()))
            .Returns((CreatePersonDto dto) => new Person
            {
                FirstName = dto.FirstName ?? string.Empty,
                LastName = dto.LastName ?? string.Empty
            });

        mock.Setup(f => f.ApplyUpdate(It.IsAny<Person>(), It.IsAny<UpdatePersonDto>()));

        return mock;
    }

    public static IHtmlSanitizerService CreateRealHtmlSanitizer()
    {
        return new HtmlSanitizerService();
    }

    public static Mock<UserManager<User>> CreateUserManager()
    {
        var store = new Mock<IUserStore<User>>();
        return new Mock<UserManager<User>>(store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
    }
}