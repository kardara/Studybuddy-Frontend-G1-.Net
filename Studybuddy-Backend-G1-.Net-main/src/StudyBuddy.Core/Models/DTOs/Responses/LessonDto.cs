namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class LessonDto
    {
        public int LessonId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public int LessonNumber { get; set; }
        public string LessonType { get; set; } = string.Empty;
        public int? EstimatedDurationMinutes { get; set; }
        public int? SequenceOrder { get; set; }
        public bool IsPreview { get; set; }
    }
}
