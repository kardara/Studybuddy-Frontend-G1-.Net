using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface ICourseService
    {
        Task<IEnumerable<CourseListDto>> GetPublishedCoursesAsync();
        Task<CourseDetailDto?> GetCourseByIdAsync(int courseId);
        Task<IEnumerable<CourseListDto>> SearchCoursesAsync(string query);
    }
}
