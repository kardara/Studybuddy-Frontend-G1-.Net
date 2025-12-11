using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class Permission
    {
        [Key]
        public int PermissionId { get; set; }
        [Required]
        [MaxLength(100)]
        public string PermissionName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
