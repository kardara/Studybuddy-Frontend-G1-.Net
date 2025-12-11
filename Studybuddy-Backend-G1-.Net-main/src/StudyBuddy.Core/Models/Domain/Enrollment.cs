using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class Enrollment
    {
        public int EnrollmentId { get; set; }
        public int StudentId { get; set; }
        public User Student { get; set; } = null!;
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        [MaxLength(20)]
        public string Status { get; set; } = "Active"; // 'Active', 'Completed', 'Dropped'
        public DateTime? CompletedAt { get; set; }
        public decimal ProgressPercentage { get; set; } = 0;
    }
}
