using System.Collections.Generic;

namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class QuizGenerationDto
    {
        public List<QuizContentDto> Quizzes { get; set; } = new List<QuizContentDto>();
    }

    public class QuizContentDto
    {
        public int ModuleId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int PassingPercentage { get; set; } = 70;
        public int DurationMinutes { get; set; } = 15;
        public List<QuestionContentDto> Questions { get; set; } = new List<QuestionContentDto>();
    }

    public class QuestionContentDto
    {
        public string QuestionText { get; set; } = string.Empty;
        public List<OptionContentDto> Options { get; set; } = new List<OptionContentDto>();
        public int Points { get; set; } = 1;
    }

    public class OptionContentDto
    {
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}