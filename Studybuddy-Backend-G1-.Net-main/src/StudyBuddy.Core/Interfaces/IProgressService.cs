using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface IProgressService
    {
        Task<bool> UpdateProgressAsync(int studentId, int lessonId, bool isCompleted);
        Task<ProgressResponse?> GetCourseProgressAsync(int studentId, int courseId);
        Task<IEnumerable<ProgressResponse>> GetStudentProgressAsync(int studentId);
    }
}
