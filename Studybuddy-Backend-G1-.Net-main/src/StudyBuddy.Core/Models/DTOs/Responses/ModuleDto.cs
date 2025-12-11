namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class ModuleDto
    {
        public int ModuleId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ModuleNumber { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public int? SequenceOrder { get; set; }
        public List<LessonDto> Lessons { get; set; } = new();
    }
}
