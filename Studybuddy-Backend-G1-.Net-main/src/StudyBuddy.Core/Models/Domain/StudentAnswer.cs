using System;

namespace StudyBuddy.Core.Models.Domain
{
    public class StudentAnswer
    {
        public int AnswerId { get; set; }
        public int AttemptId { get; set; }
        public QuizAttempt Attempt { get; set; } = null!;
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;
        public int? SelectedOptionId { get; set; }
        public QuestionOption? SelectedOption { get; set; }
        public string? AnswerText { get; set; }
        public bool? IsCorrect { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
