using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class UserPermission
    {
        [Key]
        public int UserPermissionId { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public int PermissionId { get; set; }
        public Permission Permission { get; set; } = null!;
        
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        public string? GrantedBy { get; set; } // Admin who granted this permission
        public string? Reason { get; set; } // Why this permission was granted
    }
}