using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class LessonMaterial
    {
        [Key]
        public int MaterialId { get; set; }
        public int LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        [MaxLength(300)]
        public string? Title { get; set; }
        [MaxLength(50)]
        public string? MaterialType { get; set; } // 'Link', 'Document', 'Exercise'
        public string? Content { get; set; }
        public string? ResourceUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
