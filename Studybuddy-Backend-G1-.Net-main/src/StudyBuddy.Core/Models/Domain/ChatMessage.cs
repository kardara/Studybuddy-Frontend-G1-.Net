using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class ChatMessage
    {
        [Key]
        public int MessageId { get; set; }
        public int SessionId { get; set; }
        public ChatSession Session { get; set; } = null!;
        [MaxLength(20)]
        public string? SenderType { get; set; } // 'Student', 'AI'
        public int? SenderUserId { get; set; }
        public User? SenderUser { get; set; }
        [Required]
        public string MessageText { get; set; } = string.Empty;
        [MaxLength(50)]
        public string? MessageType { get; set; } // 'Text', 'CodeBlock', 'LinkShare'
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
