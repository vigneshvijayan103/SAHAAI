using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using Sahaai.Application.Common;
using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;

namespace Sahaai.Infrastructure.Services
{
    public class MailkitService : IMailkitService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<MailkitService> _logger;

        public MailkitService(IConfiguration config, ILogger<MailkitService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendOtpEmailAsync(string toEmail, string otp, string purpose)
        {
            var smtpServer = _config["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            var portStr = _config["EmailSettings:Port"] ?? "587";
            var port = int.TryParse(portStr, out int p) ? p : 587;
            var senderEmail = _config["EmailSettings:SenderEmail"] ?? "sahaaiapp@gmail.com";
            var senderName = _config["EmailSettings:SenderName"] ?? "Sahaai Support";
            var password = _config["EmailSettings:Password"] ?? "qrlu abnw arla aayg";

            string subject;
            string heading;
            string description;

            switch (purpose.ToLowerInvariant())
            {
                case "register":
                    subject = "Verify Your Email - Sahaai";
                    heading = "Verify Your Email Address";
                    description = "Thank you for joining Sahaai. Use the 6-digit verification code below to activate your account:";
                    break;

                case "forgot":
                    subject = "Reset Your Password - Sahaai";
                    heading = "Password Reset Request";
                    description = "We received a request to reset your password. Use the 6-digit verification code below:";
                    break;

                default:
                    subject = "Your Verification Code - Sahaai";
                    heading = "Verification Code";
                    description = "Use the 6-digit verification code below:";
                    break;
            }

            var htmlBody = $@"
<div style=""font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"">
    <div style=""background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px 24px; text-align: center;"">
        <h1 style=""color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;"">SAHAAI</h1>
        <p style=""color: #c7d2fe; margin: 6px 0 0 0; font-size: 13px;"">Emergency Dispatch & Rapid Response Network</p>
    </div>
    <div style=""padding: 32px 24px;"">
        <h2 style=""color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;"">{heading}</h2>
        <p style=""color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;"">{description}</p>
        
        <div style=""background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px 0;"">
            <span style=""font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace;"">{otp}</span>
            <p style=""margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;"">Expires in 5 minutes</p>
        </div>

        <p style=""color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;"">
            If you did not request this verification code, please ignore this email or contact support if you suspect unauthorized activity.
        </p>
    </div>
    <div style=""background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;"">
        <p style=""color: #94a3b8; font-size: 11px; margin: 0;"">&copy; {DateTime.UtcNow.Year} Sahaai Rapid Response. All rights reserved.</p>
    </div>
</div>";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail.Trim()));
            message.Subject = subject;

            message.Body = new TextPart("html")
            {
                Text = htmlBody
            };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(smtpServer, port, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(senderEmail, password);
                await smtp.SendAsync(message);
                await smtp.DisconnectAsync(true);
                _logger.LogInformation("Successfully sent OTP email to {ToEmail} for purpose {Purpose}", toEmail, purpose);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {ToEmail} via SMTP {SmtpServer}:{Port}", toEmail, smtpServer, port);
                throw;
            }
        }
    }
}
