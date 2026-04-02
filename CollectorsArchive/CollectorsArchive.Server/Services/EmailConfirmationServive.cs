
using CollectorsArchive.Server.Models;
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

            // adding timeout to prevent hanging
            client.Timeout = 10000;

            // try to connect to the SMTP server with SSL, if it fails, try without SSL
            await client.ConnectAsync("smtp.gmail.com", 465, SecureSocketOptions.SslOnConnect);

            await client.AuthenticateAsync(emailSettings.Email, emailSettings.AppPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
