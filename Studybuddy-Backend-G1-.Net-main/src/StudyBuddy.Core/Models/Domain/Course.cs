using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class Course
    {
        public int CourseId { get; set; }
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        [MaxLength(100)]
        public string? Category { get; set; }
        public string? SourcePdfUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        [MaxLength(20)]
        public string Status { get; set; } = "Draft"; // 'Draft', 'Published', 'Archived'
        public int CreatedBy { get; set; }
        public User Creator { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; }
        public int TotalEnrollments { get; set; } = 0;
        public decimal? AverageRating { get; set; }
        public decimal? DurationHours { get; set; }

        public ICollection<Module> Modules { get; set; } = new List<Module>();
        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
        public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
        public ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();
        public ICollection<StudentProgress> StudentProgresses { get; set; } = new List<StudentProgress>();
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
        public ICollection<FAQTracker> FAQs { get; set; } = new List<FAQTracker>();
    }
}
