using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Services;
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

    public static IHtmlSanitizerService CreateRealHtmlSanitizer()
    {
        // If you have a real implementation for integration tests
        return new HtmlSanitizerService();
    }
}