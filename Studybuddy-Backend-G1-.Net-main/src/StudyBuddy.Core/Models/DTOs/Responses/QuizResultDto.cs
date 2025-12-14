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
        public bool CertificateIssued { get; set; }
        public List<QuestionResultDto> QuestionResults { get; set; } = new();
    }

    public class QuestionResultDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string StudentAnswer { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int PointsEarned { get; set; }
        public int PointsTotal { get; set; }
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
