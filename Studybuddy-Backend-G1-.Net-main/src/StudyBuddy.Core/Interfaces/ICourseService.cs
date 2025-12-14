using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface ICourseService
    {
        #region Public Course Access
        Task<IEnumerable<CourseListDto>> GetPublishedCoursesAsync();
        Task<CourseDetailDto?> GetCourseByIdAsync(int courseId);
        Task<IEnumerable<CourseListDto>> SearchCoursesAsync(string query);

        #endregion

        #region Admin Course Management
        Task<CourseDetailDto?> CreateCourseAsync(CreateCourseRequestDto request);
        Task<CourseDetailDto?> UpdateCourseAsync(int courseId, UpdateCourseRequestDto request);
        Task<bool> PublishCourseAsync(int courseId);
        Task<bool> UnpublishCourseAsync(int courseId);
        Task<bool> DeleteCourseAsync(int courseId);
        Task<IEnumerable<CourseListDto>> GetAllCoursesAsync();
        Task<CourseDetailDto?> GetCourseDetailsForAdminAsync(int courseId);

        #endregion

        #region Course Content Management
        Task<ModuleDto?> CreateModuleAsync(int courseId, CreateModuleRequestDto request);
        Task<ModuleDto?> GetModuleAsync(int courseId, int moduleId);
        Task<LessonDto?> CreateLessonAsync(int courseId, int moduleId, CreateLessonRequestDto request);
        Task<LessonDto?> GetLessonAsync(int courseId, int moduleId, int lessonId);

        #endregion

        #region Bulk Content Retrieval
        Task<IEnumerable<ModuleDto>> GetAllModulesForCourseAsync(int courseId);
        Task<IEnumerable<LessonDto>> GetAllLessonsForModuleAsync(int courseId, int moduleId);

        #endregion

        #region Quiz Management
        Task<QuizDto?> CreateQuizAsync(CreateQuizRequestDto request);

        #endregion
    }
}
