using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface IAnalyticsService
    {
        Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(DashboardAnalyticsRequestDto request);
        Task<CourseAnalyticsDto> GetCourseAnalyticsAsync(CourseAnalyticsRequestDto request);
        Task<StudentAnalyticsListDto> GetStudentAnalyticsAsync(StudentAnalyticsRequestDto request);
        Task<StudentAnalyticsDto> GetStudentProgressAnalyticsAsync(int studentId);
        Task<ExportReportDto> ExportReportAsync(ExportReportRequestDto request);
        Task<List<CourseSummaryDto>> GetTopPerformingCoursesAsync(int count = 10);
        Task<List<StudentSummaryDto>> GetMostActiveStudentsAsync(int count = 10);
        Task<Dictionary<string, int>> GetEnrollmentTrendsAsync(DateTime startDate, DateTime endDate);
    }
}