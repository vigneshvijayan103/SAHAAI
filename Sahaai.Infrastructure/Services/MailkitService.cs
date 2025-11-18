using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MimeKit;
using Sahaai.Application.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MailKit.Net.Smtp;


namespace Sahaai.Infrastructure.Services
{
    public class MailkitService:IMailkitService
    {
        private readonly IConfiguration _config;

        public MailkitService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendOtpEmailAsync(string toEmail, string otp, string purpose)
        {
            var smtpServer = _config["EmailSettings:SmtpServer"];
            var port = int.Parse(_config["EmailSettings:Port"]);
            var senderEmail = _config["EmailSettings:SenderEmail"];
            var senderName = _config["EmailSettings:SenderName"];
            var password = _config["EmailSettings:Password"];

            string subject;
            string body;

            switch (purpose.ToLower())
            {
                case "register":
                    subject = "Verify Your Email - OTP";
                    body = $"Your verification OTP is <b>{otp}</b>. It expires in 5 minutes.";
                    break;

                case "forgot":
                    subject = "Reset Your Password - OTP";
                    body = $"Your password reset OTP is <b>{otp}</b>. It expires in 5 minutes.";
                    break;

                default:
                    subject = "Your OTP Code";
                    body = $"Your OTP is <b>{otp}</b>.";
                    break;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            message.Body = new TextPart("html")
            {
                Text = body
            };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpServer, port, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(senderEmail, password);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }

    }
}
