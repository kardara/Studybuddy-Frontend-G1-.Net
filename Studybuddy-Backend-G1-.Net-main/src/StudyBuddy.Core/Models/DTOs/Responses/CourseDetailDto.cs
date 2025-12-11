namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class CourseDetailDto
    {
        public int CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string Level { get; set; } = string.Empty;
        public string? Category { get; set; }
        public int? EstimatedDurationHours { get; set; }
        public string? Prerequisites { get; set; }
        public string? LearningObjectives { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public int EnrollmentCount { get; set; }
        public List<ModuleDto> Modules { get; set; } = new();
    }
}
