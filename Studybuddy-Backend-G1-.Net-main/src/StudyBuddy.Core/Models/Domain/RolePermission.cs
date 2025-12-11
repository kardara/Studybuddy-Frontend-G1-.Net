using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class RolePermission
    {
        [Key]
        public int RolePermissionId { get; set; }
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty;
        public int PermissionId { get; set; }
        public Permission Permission { get; set; } = null!;
    }
}
