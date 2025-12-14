using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class User
    {
        public int UserId { get; set; }
        [Required]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
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
        public string Role { get; set; } = string.Empty; // 'Admin', 'Student'
        public bool IsActive { get; set; } = true;
        public bool IsBlocked { get; set; } = false;
        public string? BlockReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }

        // Navigation Properties
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
        public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
        public ICollection<Course> CreatedCourses { get; set; } = new List<Course>();
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public ICollection<StudentProgress> StudentProgresses { get; set; } = new List<StudentProgress>();
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
        public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
        public ICollection<UserActivity> UserActivities { get; set; } = new List<UserActivity>();
        public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
    }
}
