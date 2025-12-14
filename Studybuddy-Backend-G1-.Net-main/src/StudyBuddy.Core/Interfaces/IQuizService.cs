using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface IQuizService
    {
        // Basic quiz operations
        Task<QuizDto?> GetQuizByIdAsync(int quizId);
        Task<IEnumerable<QuizDto>> GetQuizzesByCourseAsync(int courseId);
        Task<IEnumerable<QuizDto>> GetQuizzesByModuleAsync(int moduleId);
        
        // Admin quiz management
        Task<QuizDto?> CreateQuizAsync(CreateQuizRequestDto request);
        Task<QuizDto?> UpdateQuizAsync(int quizId, UpdateQuizRequestDto request);
        Task<bool> DeleteQuizAsync(int quizId);
        Task<bool> PublishQuizAsync(int quizId);
        Task<bool> UnpublishQuizAsync(int quizId);
        Task<IEnumerable<QuizListDto>> GetAllQuizzesAsync();
        Task<IEnumerable<QuizDto>> GetAllQuizzesForCourseAsync(int courseId);
        
        // Quiz attempts
        Task<QuizAttemptResponseDto> StartQuizAsync(int studentId, int quizId);
        Task<QuizAttemptResponseDto> StartQuizAttemptAsync(int quizId, int studentId);
        Task<QuizResultDto?> SubmitQuizAttemptAsync(int attemptId, int studentId, IEnumerable<SubmitAnswerDto> answers);
        Task<QuizResultDto> SubmitQuizAsync(int studentId, QuizSubmissionRequest submission);
        Task<QuizResultDto?> GetQuizAttemptAsync(int attemptId, int studentId);
        Task<IEnumerable<QuizResultDto>> GetStudentQuizAttemptsAsync(int studentId);
        Task<IEnumerable<QuizResultDto>> GetQuizAttemptsAsync(int studentId, int quizId);
        Task<QuizResultDto?> GetQuizResultAsync(int attemptId);
        Task<bool> CanStudentRetakeQuizAsync(int studentId, int quizId);
    }
}
