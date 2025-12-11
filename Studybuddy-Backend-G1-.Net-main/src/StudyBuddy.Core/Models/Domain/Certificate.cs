using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class Certificate
    {
        public int CertificateId { get; set; }
        public int StudentId { get; set; }
        public User Student { get; set; } = null!;
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        [Required]
        [MaxLength(100)]
        public string CertificateNumber { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }
        public string? CertificateUrl { get; set; }
        public string? CertificatePdfPath { get; set; }
        [MaxLength(20)]
        public string Status { get; set; } = "Issued"; // 'Issued', 'Revoked'
    }
}
