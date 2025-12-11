namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class ProgressResponse
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public decimal ProgressPercentage { get; set; }
        public DateTime? LastAccessedAt { get; set; }
    }
}
