using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StudyBuddy.Core.Configuration;
using StudyBuddy.Core.Interfaces;
using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace StudyBuddy.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(EmailSettings emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetLink)
        {
            var subject = "Password Reset Request - StudyBuddy";
            var body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link will expire in 24 hours.</p>
    <p><a href='{resetLink}' style='background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
        Reset Password
    </a></p>
    <p>Or copy this link: <br/>{resetLink}</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
    <hr />
    <footer><small>StudyBuddy Learning Platform</small></footer>
</body>
</html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendCertificateEmailAsync(string email, string userName, string courseName, string certificateNumber, byte[] pdfBytes)
        {
            var subject = $"Certificate - {courseName} | StudyBuddy";
            var body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Congratulations, {userName}!</h2>
    <p>You have successfully completed the course <strong>{courseName}</strong>.</p>
    <p>Your certificate (No: {certificateNumber}) is attached to this email.</p>
    <p>You can also download it anytime from your StudyBuddy account dashboard.</p>
    <p>Thank you for learning with StudyBuddy!</p>
    <hr />
    <footer><small>StudyBuddy Learning Platform</small></footer>
</body>
</html>";

            using (var client = new SmtpClient(_emailSettings.SmtpHost, _emailSettings.SmtpPort))
            {
                client.EnableSsl = _emailSettings.EnableSSL;
                client.Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password);

                var mailMessage = new MailMessage(
                    new MailAddress(_emailSettings.FromAddress, _emailSettings.SenderName),
                    new MailAddress(email))
                {
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                // Attach PDF
                var ms = new MemoryStream(pdfBytes);
                var attachment = new Attachment(ms, $"Certificate_{certificateNumber}.pdf");
                mailMessage.Attachments.Add(attachment);

                try
                {
                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation($"Certificate email sent to {email}");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Failed to send email to {email}: {ex.Message}");
                    throw;
                }
            }
        }

        public async Task SendWelcomeEmailAsync(string email, string firstName)
        {
            var subject = "Welcome to StudyBuddy - Let's Start Learning!";
            var body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Welcome to StudyBuddy, {firstName}!</h2>
    <p>Your account has been successfully created.</p>
    <p>You can now:</p>
    <ul>
        <li>Browse available courses</li>
        <li>Enroll in courses of your choice</li>
        <li>Chat with our AI Study Buddy for instant help</li>
        <li>Track your progress</li>
    </ul>
    <p>Get started now and begin your learning journey!</p>
    <hr />
    <footer><small>StudyBuddy Learning Platform</small></footer>
</body>
</html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendCourseEnrollmentConfirmationAsync(string email, string courseName)
        {
            var subject = $"Enrollment Confirmation - {courseName}";
            var body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Enrollment Confirmed!</h2>
    <p>You have successfully enrolled in <strong>{courseName}</strong>.</p>
    <p>You can now access the course content and start learning.</p>
    <hr />
    <footer><small>StudyBuddy Learning Platform</small></footer>
</body>
</html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendAccountBlockNotificationAsync(string email, string blockReason)
        {
            var subject = "Account Notification - StudyBuddy";
            var body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Account Blocked</h2>
    <p>Your StudyBuddy account has been blocked by an administrator.</p>
    <p><strong>Reason:</strong> {blockReason}</p>
    <p>If you believe this is a mistake, please contact support.</p>
    <hr />
    <footer><small>StudyBuddy Learning Platform</small></footer>
</body>
</html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendAsync(string email, string subject, string body, bool isHtml = false)
        {
            await SendEmailAsync(email, subject, body);
        }

        private async Task SendEmailAsync(string email, string subject, string body)
        {
            using (var client = new SmtpClient(_emailSettings.SmtpHost, _emailSettings.SmtpPort))
            {
                client.EnableSsl = _emailSettings.EnableSSL;
                client.Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password);

                var mailMessage = new MailMessage(
                    new MailAddress(_emailSettings.FromAddress, _emailSettings.SenderName),
                    new MailAddress(email))
                {
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                try
                {
                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation($"Email sent to {email}");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Failed to send email to {email}: {ex.Message}");
                    throw;
                }
            }
        }
    }
}