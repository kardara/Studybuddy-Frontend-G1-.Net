using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class UserActivity
    {
        [Key]
        public int ActivityId { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        [MaxLength(100)]
        public string? ActivityType { get; set; } // 'CourseView', 'LessonComplete', 'QuizSubmit'
        [MaxLength(50)]
        public string? EntityType { get; set; }
        public int? EntityId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
