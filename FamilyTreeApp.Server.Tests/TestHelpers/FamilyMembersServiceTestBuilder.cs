using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace FamilyTreeApp.Server.Tests.TestHelpers;

public sealed class FamilyMemberServiceTestBuilder(FamilyTreeContext context)
{
    public Mock<ILogger<FamilyMemberService>> LoggerMock { get; } = new();
    public Mock<IPersonFactory> PersonFactoryMock { get; } = new();
    public Mock<IHtmlSanitizerService> HtmlSanitizerMock { get; } = new();

    public FamilyMemberService Build()
    {
        HtmlSanitizerMock
            .Setup(x => x.Sanitize(It.IsAny<string>()))
            .Returns((string html) => html);

        return new FamilyMemberService(
            context,
            LoggerMock.Object,
            PersonFactoryMock.Object,
            HtmlSanitizerMock.Object);
    }
}
