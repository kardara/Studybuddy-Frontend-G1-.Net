using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class ChatSession
    {
        [Key]
        public int SessionId { get; set; }
        public int StudentId { get; set; }
        public User Student { get; set; } = null!;
        public int? CourseId { get; set; }
        public Course? Course { get; set; }
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndedAt { get; set; }
        [MaxLength(20)]
        public string Status { get; set; } = "Active"; // 'Active', 'Closed'
        public int TotalMessages { get; set; } = 0;

        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
