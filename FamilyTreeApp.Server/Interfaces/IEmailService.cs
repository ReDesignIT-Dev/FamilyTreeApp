namespace FamilyTreeApp.Server.Interfaces;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string body);
    string GetActivationEmailBody(string username, string activationLink);
}