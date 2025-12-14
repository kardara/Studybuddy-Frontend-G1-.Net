namespace StudyBuddy.Core.Models.DTOs.Requests
{
    public class DashboardAnalyticsRequestDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class CourseAnalyticsRequestDto
    {
        public int CourseId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class StudentAnalyticsRequestDto
    {
        public int? StudentId { get; set; } // If null, get all students
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class ExportReportRequestDto
    {
        public string ReportType { get; set; } = string.Empty; // "courses", "students", "analytics"
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Format { get; set; } = "csv"; // "csv", "excel", "pdf"
    }
}