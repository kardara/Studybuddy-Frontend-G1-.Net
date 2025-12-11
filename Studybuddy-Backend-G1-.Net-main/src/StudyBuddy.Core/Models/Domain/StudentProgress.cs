using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class StudentProgress
    {
        public int ProgressId { get; set; }
        public int StudentId { get; set; }
        public User Student { get; set; } = null!;
        public int LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public bool IsCompleted { get; set; } = false;
        public DateTime? CompletedAt { get; set; }
        public int TimeSpentMinutes { get; set; } = 0;
        public DateTime? LastAccessedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
