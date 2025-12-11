using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class Module
    {
        public int ModuleId { get; set; }
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public int ModuleNumber { get; set; }
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public int? SequenceOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
        public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
    }
}
