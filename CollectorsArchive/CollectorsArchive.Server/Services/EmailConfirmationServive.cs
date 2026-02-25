
using CollectorsArchive.Server.Settings;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Runtime;



namespace CollectorsArchive.Server.Service
{
    public class EmailConfirmationService : IEmailService
    {
        private readonly CollectorArchiveEmailSettings emailSettings;

        public EmailConfirmationService(IOptions<CollectorArchiveEmailSettings> _emailSettings) 
        {
            emailSettings = _emailSettings.Value; 
        }
        public async Task SendAsync(string to, string subject, string body)
        {
            var message = new MimeMessage();

            message.From.Add(new MailboxAddress("Collector's Archive", emailSettings.Email));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            message.Body = new TextPart("plain")
            {
                Text = body
            };

            using var client = new MailKit.Net.Smtp.SmtpClient();

            await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(emailSettings.Email, emailSettings.AppPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
