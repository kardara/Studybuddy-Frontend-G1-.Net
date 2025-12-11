namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class CourseListDto
    {
        public int CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string Level { get; set; } = string.Empty;
        public string? Category { get; set; }
        public int? EstimatedDurationHours { get; set; }
        public DateTime CreatedAt { get; set; }
        public int EnrollmentCount { get; set; }
    }
}
