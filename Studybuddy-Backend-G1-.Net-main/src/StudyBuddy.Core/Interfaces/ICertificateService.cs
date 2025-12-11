using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface ICertificateService
    {
        Task<CertificateDto?> IssueCertificateAsync(int studentId, int courseId);
        Task<IEnumerable<CertificateDto>> GetStudentCertificatesAsync(int studentId);
        Task<CertificateDto?> GetCertificateByNumberAsync(string certificateNumber);
    }
}
