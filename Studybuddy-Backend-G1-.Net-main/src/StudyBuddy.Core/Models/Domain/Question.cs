using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class Question
    {
        public int QuestionId { get; set; }
        public int QuizId { get; set; }
        public Quiz Quiz { get; set; } = null!;
        [Required]
        public string QuestionText { get; set; } = string.Empty;
        [MaxLength(50)]
        public string? QuestionType { get; set; } // 'MultipleChoice', 'TrueFalse', 'ShortAnswer'
        [MaxLength(20)]
        public string? Difficulty { get; set; } // 'Easy', 'Medium', 'Hard'
        public int Points { get; set; } = 1;
        public int? SequenceOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
        public ICollection<StudentAnswer> StudentAnswers { get; set; } = new List<StudentAnswer>();
    }
}
