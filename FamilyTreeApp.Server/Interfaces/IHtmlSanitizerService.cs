namespace FamilyTreeApp.Server.Interfaces;

public interface IHtmlSanitizerService
{
    string Sanitize(string html);
}
