namespace StudyBuddy.Core.Models.DTOs.Requests
{
    public class QuizSubmissionRequest
    {
        public int QuizId { get; set; }
        public List<AnswerSubmission> Answers { get; set; } = new();
    }

    public class AnswerSubmission
    {
        public int QuestionId { get; set; }
        public int? SelectedOptionId { get; set; }
        public string? TextAnswer { get; set; }
    }
}
