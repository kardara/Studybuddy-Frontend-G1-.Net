using System.ComponentModel.DataAnnotations;
using StudyBuddy.Core.Interfaces;

namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class UserDto
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Alias for Id
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty; // Computed property
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsBlocked { get; set; }
        public string? BlockReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Statistics properties for detailed views
        public int TotalEnrollments { get; set; }
        public int CompletedCourses { get; set; }
        public int TotalQuizAttempts { get; set; }
        public int CertificatesEarned { get; set; }
    }

    public class UserDetailsDto
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Alias for Id
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty; // Computed property
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsBlocked { get; set; }
        public string? BlockReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? BlockedAt { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
        
        // Statistics properties
        public int TotalEnrollments { get; set; }
        public int CompletedCourses { get; set; }
        public int TotalQuizAttempts { get; set; }
        public int CertificatesEarned { get; set; }
    }

    public class UserListResponseDto
    {
        public List<UserDto> Users { get; set; } = new List<UserDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class BlockUserResponseDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public bool Success { get; set; }
        public bool IsBlocked { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime BlockedAt { get; set; }
        public string BlockReason { get; set; } = string.Empty;
    }

    public class AuditLogDto
    {
        public int AuditLogId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string? EntityType { get; set; }
        public int? EntityId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BulkUserActionResponseDto
    {
        public int Successful { get; set; }
        public int Failed { get; set; }
        public List<BulkActionErrorDto> Errors { get; set; } = new List<BulkActionErrorDto>();
    }

    public class BulkActionErrorDto
    {
        public int UserId { get; set; }
        public string Error { get; set; } = string.Empty;
    }

    public class RoleDto
    {
        public string RoleName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
    }

    public class PermissionResponseDto
    {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}