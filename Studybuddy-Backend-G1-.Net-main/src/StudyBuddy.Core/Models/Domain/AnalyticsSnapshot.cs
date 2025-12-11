using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class AnalyticsSnapshot
    {
        [Key]
        public int SnapshotId { get; set; }
        public DateTime SnapshotDate { get; set; }
        public int? TotalActiveUsers { get; set; }
        public int? TotalCoursesEnrolled { get; set; }
        public int? TotalLessonsCompleted { get; set; }
        public int? TotalQuizzesSubmitted { get; set; }
        public decimal? AverageCompletionRate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
