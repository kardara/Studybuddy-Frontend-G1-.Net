using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.DTOs.Requests
{
    public class CreateCourseRequestDto
    {
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Category { get; set; }

        public string? Level { get; set; }
        
        public int? EstimatedDurationHours { get; set; }
        
        public string? Prerequisites { get; set; }
        
        public string? LearningObjectives { get; set; }
        
        public string? ThumbnailUrl { get; set; }

        public string? SourcePdfUrl { get; set; }
        
        public string? GeneratedContent { get; set; }

        [Required]
        public int CreatedBy { get; set; }
    }

    public class UpdateCourseRequestDto
    {
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Category { get; set; }

        public string? Level { get; set; }
        
        public int? EstimatedDurationHours { get; set; }
        
        public string? Prerequisites { get; set; }
        
        public string? LearningObjectives { get; set; }
        
        public string? ThumbnailUrl { get; set; }
    }

    public class CreateModuleRequestDto
    {
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int ModuleNumber { get; set; }

        public int? EstimatedDurationMinutes { get; set; }

        public int SequenceOrder { get; set; }
    }

    public class CreateLessonRequestDto
    {
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [StringLength(50)]
        public string ContentType { get; set; } = "Text";

        public string? VideoUrl { get; set; }

        public int LessonNumber { get; set; }

        public int? EstimatedDurationMinutes { get; set; }

        public int SequenceOrder { get; set; }
    }


    public class GenerateQuizzesRequestDto
    {
        [Required]
        public int CourseId { get; set; }
    }
}