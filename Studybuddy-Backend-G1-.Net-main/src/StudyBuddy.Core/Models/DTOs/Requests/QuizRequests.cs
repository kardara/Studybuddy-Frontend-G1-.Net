using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.DTOs.Requests
{
    public class CreateQuizRequestDto
    {
        [Required]
        public int CourseId { get; set; }

        public int? ModuleId { get; set; }

        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [MinLength(1)]
        public List<CreateQuestionDto> Questions { get; set; } = new();

        public int PassingPercentage { get; set; } = 70;

        public int? DurationMinutes { get; set; }

        public bool AllowRetake { get; set; } = true;

        public int MaxAttempts { get; set; } = 3;
    }

    public class UpdateQuizRequestDto
    {
        [StringLength(300)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public int? CourseId { get; set; }

        public int? PassingPercentage { get; set; }

        public int? DurationMinutes { get; set; }

        public bool? AllowRetake { get; set; }

        public int? MaxAttempts { get; set; }

        public bool? IsActive { get; set; }
    }

    public class SubmitQuizAttemptRequestDto
    {
        [Required]
        public List<SubmitAnswerDto> Answers { get; set; } = new();
    }

    public class SubmitAnswerDto
    {
        [Required]
        public int QuestionId { get; set; }

        public int? SelectedOptionId { get; set; }

        public string? AnswerText { get; set; }
    }

    public class CreateQuestionDto
    {
        [Required]
        public string QuestionText { get; set; } = string.Empty;

        [StringLength(50)]
        public string QuestionType { get; set; } = "MultipleChoice";

        public int Points { get; set; } = 1;

        [Required]
        [MinLength(2)]
        public List<CreateOptionDto> Options { get; set; } = new();
    }

    public class CreateOptionDto
    {
        [Required]
        public string OptionText { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }
    }

    public class ToggleStatusRequest
    {
        public bool IsActive { get; set; }
    }
}