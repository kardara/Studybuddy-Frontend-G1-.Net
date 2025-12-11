namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class EnrollmentResponse
    {
        public int EnrollmentId { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal ProgressPercentage { get; set; }
    }
}
