using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface IEnrollmentService
    {
        Task<EnrollmentResponse> EnrollStudentAsync(int studentId, int courseId);
        Task<IEnumerable<EnrollmentResponse>> GetStudentEnrollmentsAsync(int studentId);
        Task<bool> CheckEnrollmentAsync(int studentId, int courseId);
    }
}
