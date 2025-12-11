using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using StudyBuddy.Data;

namespace StudyBuddy.Services.Implementations
{
    public class QuizService : IQuizService
    {
        private readonly AppDbContext _context;

        public QuizService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<QuizDto?> GetQuizByIdAsync(int quizId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions.OrderBy(qu => qu.SequenceOrder))
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.SequenceOrder))
                .FirstOrDefaultAsync(q => q.QuizId == quizId);

            if (quiz == null)
                return null;

            return new QuizDto
            {
                QuizId = quiz.QuizId,
                Title = quiz.Title,
                Description = quiz.Description,
                TotalQuestions = quiz.TotalQuestions,
                PassingPercentage = quiz.PassingPercentage,
                DurationMinutes = quiz.DurationMinutes,
                MaxAttempts = quiz.MaxAttempts,
                Questions = quiz.Questions.Select(q => new QuestionDto
                {
                    QuestionId = q.QuestionId,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    Points = q.Points,
                    Options = q.Options.Select(o => new QuestionOptionDto
                    {
                        OptionId = o.OptionId,
                        OptionText = o.OptionText
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<QuizResultDto> SubmitQuizAsync(int studentId, QuizSubmissionRequest submission)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(q => q.QuizId == submission.QuizId);

            if (quiz == null)
                throw new InvalidOperationException("Quiz not found");

            // Check enrollment
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == quiz.CourseId);

            if (enrollment == null)
                throw new UnauthorizedAccessException("Not enrolled in this course");

            // Check attempt limit
            var attemptCount = await _context.QuizAttempts
                .CountAsync(qa => qa.StudentId == studentId && qa.QuizId == submission.QuizId);

            if (attemptCount >= quiz.MaxAttempts)
                throw new InvalidOperationException("Maximum attempts reached");

            // Create quiz attempt
            var attempt = new QuizAttempt
            {
                QuizId = submission.QuizId,
                StudentId = studentId,
                CourseId = quiz.CourseId,
                StartedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow,
                Status = "Submitted"
            };

            _context.QuizAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            // Grade the quiz
            int totalScore = 0;
            int maxScore = quiz.Questions.Sum(q => q.Points);

            foreach (var answer in submission.Answers)
            {
                var question = quiz.Questions.FirstOrDefault(q => q.QuestionId == answer.QuestionId);
                if (question == null) continue;

                var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                bool isCorrect = correctOption != null && correctOption.OptionId == answer.SelectedOptionId;

                var studentAnswer = new StudentAnswer
                {
                    AttemptId = attempt.AttemptId,
                    QuestionId = answer.QuestionId,
                    SelectedOptionId = answer.SelectedOptionId,
                    IsCorrect = isCorrect
                    // Points calculated based on IsCorrect flag
                };

                _context.StudentAnswers.Add(studentAnswer);
                if (isCorrect) totalScore += question.Points;
            }

            // Update attempt with scores
            attempt.TotalScore = totalScore;
            attempt.MaxScore = maxScore;
            attempt.PercentageScore = maxScore > 0 ? (decimal)totalScore / maxScore * 100 : 0;
            // IsPassed is calculated from PercentageScore >= PassingPercentage

            await _context.SaveChangesAsync();

            return await CreateQuizResultDto(attempt, quiz);
        }

        public async Task<IEnumerable<QuizResultDto>> GetQuizAttemptsAsync(int studentId, int quizId)
        {
            var attempts = await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Where(qa => qa.StudentId == studentId && qa.QuizId == quizId)
                .OrderByDescending(qa => qa.StartedAt)
                .ToListAsync();

            var results = new List<QuizResultDto>();
            foreach (var attempt in attempts)
            {
                results.Add(await CreateQuizResultDto(attempt, attempt.Quiz));
            }

            return results;
        }

        public async Task<QuizResultDto?> GetQuizResultAsync(int attemptId)
        {
            var attempt = await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .FirstOrDefaultAsync(qa => qa.AttemptId == attemptId);

            if (attempt == null)
                return null;

            return await CreateQuizResultDto(attempt, attempt.Quiz);
        }

        private async Task<QuizResultDto> CreateQuizResultDto(QuizAttempt attempt, Quiz quiz)
        {
            var attemptCount = await _context.QuizAttempts
                .CountAsync(qa => qa.StudentId == attempt.StudentId && qa.QuizId == attempt.QuizId);

            var isPassed = attempt.PercentageScore >= quiz.PassingPercentage;

            return new QuizResultDto
            {
                AttemptId = attempt.AttemptId,
                QuizId = attempt.QuizId,
                QuizTitle = quiz.Title,
                AttemptedAt = attempt.StartedAt,
                SubmittedAt = attempt.CompletedAt,
                TotalScore = attempt.TotalScore,
                MaxScore = attempt.MaxScore,
                PercentageScore = attempt.PercentageScore,
                IsPassed = isPassed,
                AttemptsUsed = attemptCount,
                MaxAttempts = quiz.MaxAttempts,
                CanRetake = attemptCount < quiz.MaxAttempts
            };
        }
    }
}
