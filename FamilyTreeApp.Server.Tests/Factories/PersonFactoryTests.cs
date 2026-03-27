using FamilyTreeApp.Server.Dtos.Person;
using FamilyTreeApp.Server.Factories;
using FamilyTreeApp.Server.Tests.Helpers;
using Moq;

namespace FamilyTreeApp.Server.Tests.Factories;

public class PersonFactoryTests
{
    private readonly PersonFactory _factory;
    private readonly Mock<FamilyTreeApp.Server.Interfaces.IHtmlSanitizerService> _mockSanitizer;

    public PersonFactoryTests()
    {
        _mockSanitizer = MockServiceFactory.CreateHtmlSanitizer();
        _factory = new PersonFactory(_mockSanitizer.Object);
    }

    [Fact]
    public void Create_TrimsWhitespace_FromAllFields()
    {
        var dto = new CreatePersonDto
        {
            FirstName = "  John  ",
            LastName = "  Doe  ",
            MiddleName = "  Michael  ",
            MaidenName = "  Smith  ",
            BirthPlace = "  New York  ",
            DeathPlace = "  Boston  ",
            Gender = "  Male  "
        };

        var person = _factory.Create(dto);

        Assert.Equal("John", person.FirstName);
        Assert.Equal("Doe", person.LastName);
        Assert.Equal("Michael", person.MiddleName);
        Assert.Equal("Smith", person.MaidenName);
        Assert.Equal("New York", person.BirthPlace);
        Assert.Equal("Boston", person.DeathPlace);
        Assert.Equal("Male", person.Gender);
    }

    [Fact]
    public void Create_WithBiography_SanitizesHtml()
    {
        _mockSanitizer
            .Setup(x => x.Sanitize("<script>alert('xss')</script>"))
            .Returns("alert('xss')");

        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe",
            Biography = "<script>alert('xss')</script>"
        };

        var person = _factory.Create(dto);

        _mockSanitizer.Verify(x => x.Sanitize("<script>alert('xss')</script>"), Times.Once);
        Assert.Equal("alert('xss')", person.Biography);
    }

    [Fact]
    public void Create_EmptyBiography_SetsToNull()
    {
        var dto = new CreatePersonDto
        {
            FirstName = "John",
            LastName = "Doe",
            Biography = "   "
        };

        var person = _factory.Create(dto);

        Assert.Null(person.Biography);
        _mockSanitizer.Verify(x => x.Sanitize(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public void Create_SetsCreatedAtToUtcNow()
    {
        var before = DateTime.UtcNow;
        var dto = new CreatePersonDto { FirstName = "John", LastName = "Doe" };

        var person = _factory.Create(dto);

        Assert.InRange(person.CreatedAt, before, DateTime.UtcNow);
    }

    [Fact]
    public void ApplyUpdate_TrimsWhitespace_FromAllFields()
    {
        var person = new FamilyTreeApp.Server.Models.Person
        {
            FirstName = "Old",
            LastName = "Name"
        };

        var dto = new UpdatePersonDto
        {
            FirstName = "  Jane  ",
            LastName = "  Smith  ",
            MiddleName = "  Ann  ",
            Gender = "  Female  "
        };

        _factory.ApplyUpdate(person, dto);

        Assert.Equal("Jane", person.FirstName);
        Assert.Equal("Smith", person.LastName);
        Assert.Equal("Ann", person.MiddleName);
        Assert.Equal("Female", person.Gender);
    }
}