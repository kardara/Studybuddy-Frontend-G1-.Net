using System.Collections.Generic;

namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class CourseContentDto
    {
        public List<ModuleContentDto> Modules { get; set; } = new List<ModuleContentDto>();
    }

    public class ModuleContentDto
    {
        public int ModuleNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedDuration { get; set; }
        public int SequenceOrder { get; set; }
        public List<LessonContentDto> Lessons { get; set; } = new List<LessonContentDto>();
    }

    public class LessonContentDto
    {
        public int LessonNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string YouTubeLink { get; set; } = string.Empty;
        public int EstimatedDuration { get; set; }
        public int SequenceOrder { get; set; }
    }
}