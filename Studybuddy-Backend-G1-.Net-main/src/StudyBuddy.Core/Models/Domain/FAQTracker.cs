using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class FAQTracker
    {
        [Key]
        public int FAQId { get; set; }
        [Required]
        public string Question { get; set; } = string.Empty;
        public int? CourseId { get; set; }
        public Course? Course { get; set; }
        public int AskCount { get; set; } = 1;
        public DateTime LastAskedAt { get; set; } = DateTime.UtcNow;
        public int? CategoryId { get; set; }
    }
}
