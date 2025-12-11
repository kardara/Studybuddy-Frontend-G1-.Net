using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class Quiz
    {
        public int QuizId { get; set; }
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public int? ModuleId { get; set; }
        public Module? Module { get; set; }
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TotalQuestions { get; set; }
        public int PassingPercentage { get; set; } = 70;
        public int? DurationMinutes { get; set; }
        [MaxLength(20)]
        public string Status { get; set; } = "Published"; // 'Draft', 'Published', 'Archived'
        public bool AllowRetake { get; set; } = true;
        public int MaxAttempts { get; set; } = 3;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
    }
}
