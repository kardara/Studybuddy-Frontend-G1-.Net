using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class PasswordResetToken
    {
        [Key]
        public int TokenId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(500)]
        public string ResetToken { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTime? UsedAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public virtual User User { get; set; } = null!;
    }
}