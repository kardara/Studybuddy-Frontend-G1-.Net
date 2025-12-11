using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class QuestionOption
    {
        public int OptionId { get; set; }
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;
        [Required]
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int? SequenceOrder { get; set; }
    }
}
