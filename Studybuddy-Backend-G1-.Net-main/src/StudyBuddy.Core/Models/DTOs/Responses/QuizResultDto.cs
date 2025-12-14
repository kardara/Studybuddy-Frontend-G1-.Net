namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class QuizResultDto
    {
        public int AttemptId { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public DateTime AttemptedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public int? TotalScore { get; set; }
        public int? MaxScore { get; set; }
        public decimal? PercentageScore { get; set; }
        public bool IsPassed { get; set; }
        public int AttemptsUsed { get; set; }
        public int MaxAttempts { get; set; }
        public bool CanRetake { get; set; }
    }

    public class QuizAttemptResponseDto
    {
        public int AttemptId { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int DurationMinutes { get; set; }
        public int TotalQuestions { get; set; }
        public int AttemptsUsed { get; set; }
        public int MaxAttempts { get; set; }
        public bool CanRetake { get; set; }
    }
}
