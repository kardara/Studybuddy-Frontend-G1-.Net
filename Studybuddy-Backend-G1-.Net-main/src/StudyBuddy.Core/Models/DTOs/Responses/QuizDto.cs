namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class QuizDto
    {
        public int QuizId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TotalQuestions { get; set; }
        public int PassingPercentage { get; set; }
        public int? DurationMinutes { get; set; }
        public int MaxAttempts { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuestionDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public int Points { get; set; }
        public List<QuestionOptionDto> Options { get; set; } = new();
    }

    public class QuestionOptionDto
    {
        public int OptionId { get; set; }
        public string OptionText { get; set; } = string.Empty;
    }
}
