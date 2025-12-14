using System.Threading.Tasks;

namespace StudyBuddy.Core.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string resetLink);
        Task SendCertificateEmailAsync(string email, string userName, string courseName, string certificateNumber, byte[] pdfBytes);
        Task SendWelcomeEmailAsync(string email, string firstName);
        Task SendCourseEnrollmentConfirmationAsync(string email, string courseName);
        Task SendAccountBlockNotificationAsync(string email, string blockReason);
        Task SendAsync(string to, string subject, string body, bool isHtml = false);
    }
}