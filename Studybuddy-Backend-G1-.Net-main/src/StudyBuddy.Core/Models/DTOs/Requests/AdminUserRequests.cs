using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.DTOs.Requests
{
    public class UpdateUserRequestDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        [EmailAddress]
        public string? Email { get; set; }
        
        public string? PhoneNumber { get; set; }
        
        [Required]
        public string Role { get; set; } = "Student";
        
        public bool IsActive { get; set; } = true;
    }

    public class BlockUserRequestDto
    {
        [Required]
        public string BlockReason { get; set; } = string.Empty;
    }

    public class UserListRequestDto
    {
        public string? SearchTerm { get; set; }
        public string? Role { get; set; }
        public bool? IsBlocked { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class CreateUserRequestDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Student";
        
        public bool IsActive { get; set; } = true;
        public bool IsBlocked { get; set; } = false;
        public string? BlockReason { get; set; }
    }

    public class BulkUserActionRequestDto
    {
        public string Action { get; set; } = string.Empty; // "block", "unblock", "delete", "change_role"
        public List<int> UserIds { get; set; } = new List<int>();
        public string? Reason { get; set; }
        public string? NewRole { get; set; }
        public bool NotifyUsers { get; set; } = false;
    }
}