using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class Lesson
    {
        public int LessonId { get; set; }
        public int ModuleId { get; set; }
        public Module Module { get; set; } = null!;
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public int LessonNumber { get; set; }
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        [MaxLength(50)]
        public string? ContentType { get; set; } // 'Text', 'Video', 'PDF'
        public string? VideoUrl { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public int? SequenceOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<LessonMaterial> Materials { get; set; } = new List<LessonMaterial>();
        public ICollection<StudentProgress> StudentProgresses { get; set; } = new List<StudentProgress>();
    }
}
