namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class DashboardAnalyticsDto
    {
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public int TotalEnrollments { get; set; }
        public int ActiveStudentsToday { get; set; }
        public int TotalQuizzesSubmitted { get; set; }
        public decimal AverageCompletionRate { get; set; }
        public int TotalCertificatesIssued { get; set; }
        public List<DailyMetricDto> DailyMetrics { get; set; } = new();
        public List<CourseSummaryDto> TopCourses { get; set; } = new();
        public List<StudentSummaryDto> RecentStudents { get; set; } = new();
    }

    public class CourseAnalyticsDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int TotalEnrollments { get; set; }
        public int ActiveStudents { get; set; }
        public int CompletedStudents { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal AverageProgress { get; set; }
        public int TotalQuizzes { get; set; }
        public int TotalQuizAttempts { get; set; }
        public decimal AverageQuizScore { get; set; }
        public int CertificatesIssued { get; set; }
        public List<EnrollmentTrendDto> EnrollmentTrends { get; set; } = new();
        public List<ProgressDistributionDto> ProgressDistribution { get; set; } = new();
    }

    public class StudentAnalyticsDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime RegistrationDate { get; set; }
        public int TotalEnrollments { get; set; }
        public int CompletedCourses { get; set; }
        public int TotalQuizAttempts { get; set; }
        public decimal AverageQuizScore { get; set; }
        public int CertificatesEarned { get; set; }
        public int TotalStudyTimeMinutes { get; set; }
        public List<CourseProgressDto> CourseProgress { get; set; } = new();
        public List<QuizPerformanceDto> QuizPerformance { get; set; } = new();
    }

    public class StudentAnalyticsListDto
    {
        public List<StudentAnalyticsDto> Students { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class ExportReportDto
    {
        public string ReportName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public byte[] FileContent { get; set; } = Array.Empty<byte>();
        public DateTime GeneratedAt { get; set; }
    }

    // Supporting DTOs
    public class DailyMetricDto
    {
        public DateTime Date { get; set; }
        public int NewRegistrations { get; set; }
        public int NewEnrollments { get; set; }
        public int QuizzesCompleted { get; set; }
        public int CertificatesIssued { get; set; }
    }

    public class CourseSummaryDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int TotalEnrollments { get; set; }
        public int CompletedStudents { get; set; }
        public decimal CompletionRate { get; set; }
    }

    public class StudentSummaryDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime RegistrationDate { get; set; }
        public int TotalEnrollments { get; set; }
    }

    public class EnrollmentTrendDto
    {
        public DateTime Date { get; set; }
        public int NewEnrollments { get; set; }
        public int TotalEnrollments { get; set; }
    }

    public class ProgressDistributionDto
    {
        public string ProgressRange { get; set; } = string.Empty; // "0-25%", "26-50%", etc.
        public int StudentCount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class CourseProgressDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public decimal ProgressPercentage { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class QuizPerformanceDto
    {
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public int TotalAttempts { get; set; }
        public decimal BestScore { get; set; }
        public decimal AverageScore { get; set; }
        public DateTime LastAttemptAt { get; set; }
    }
}