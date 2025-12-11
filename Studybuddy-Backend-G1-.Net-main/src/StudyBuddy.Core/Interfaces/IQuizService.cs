using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface IQuizService
    {
        Task<QuizDto?> GetQuizByIdAsync(int quizId);
        Task<QuizResultDto> SubmitQuizAsync(int studentId, QuizSubmissionRequest submission);
        Task<IEnumerable<QuizResultDto>> GetQuizAttemptsAsync(int studentId, int quizId);
        Task<QuizResultDto?> GetQuizResultAsync(int attemptId);
    }
}
