using FamilyTreeApp.Server.Data;
using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Interfaces;
using FamilyTreeApp.Server.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace FamilyTreeApp.Server.Tests.TestHelpers;

public sealed class FamilyMemberServiceTestBuilder
{
    private readonly FamilyTreeContext _context;

    public Mock<ILogger<FamilyMemberService>> LoggerMock { get; } = new();
    public Mock<IPersonFactory> PersonFactoryMock { get; } = new();
    public Mock<IHtmlSanitizerService> HtmlSanitizerMock { get; } = new();

    public FamilyMemberServiceTestBuilder(FamilyTreeContext context)
    {
        _context = context;

        // Configure the mock to actually create people
        PersonFactoryMock
            .Setup(x => x.Create(It.IsAny<CreatePersonDto>()))
            .Returns((CreatePersonDto dto) =>
                FamilyMemberTestDataFactory.CreatePersonEntity(
                    firstName: dto.FirstName,
                    lastName: dto.LastName,
                    gender: dto.Gender));
    }

    public FamilyMemberService Build()
    {
        return new FamilyMemberService(_context, LoggerMock.Object,
            PersonFactoryMock.Object, HtmlSanitizerMock.Object);
    }
}
