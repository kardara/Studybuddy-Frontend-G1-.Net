using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using StudyBuddy.Data;
using System;

namespace StudyBuddy.Services.Implementations
{
    public class QuizService : IQuizService
    {
        private readonly AppDbContext _context;
        private readonly ICertificateService _certificateService;

        public QuizService(AppDbContext context, ICertificateService certificateService)
        {
            _context = context;
            _certificateService = certificateService;
        }

        #region Basic Quiz Operations

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
                    QuestionType = q.QuestionType ?? "MultipleChoice",
                    Points = q.Points,
                    Options = q.Options.Select(o => new QuestionOptionDto
                    {
                        OptionId = o.OptionId,
                        OptionText = o.OptionText
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<IEnumerable<QuizDto>> GetQuizzesByCourseAsync(int courseId)
        {
            var quizzes = await _context.Quizzes
                .Where(q => q.CourseId == courseId && q.Status == "Published")
                .Include(q => q.Questions.OrderBy(qu => qu.SequenceOrder))
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.SequenceOrder))
                .OrderBy(q => q.Title)
                .ToListAsync();

            return quizzes.Select(quiz => new QuizDto
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
                    QuestionType = q.QuestionType ?? "MultipleChoice",
                    Points = q.Points,
                    Options = q.Options.Select(o => new QuestionOptionDto
                    {
                        OptionId = o.OptionId,
                        OptionText = o.OptionText
                    }).ToList()
                }).ToList()
            });
        }

        public async Task<IEnumerable<QuizDto>> GetQuizzesByModuleAsync(int moduleId)
        {
            var quizzes = await _context.Quizzes
                .Where(q => q.ModuleId == moduleId && q.Status == "Published")
                .Include(q => q.Questions.OrderBy(qu => qu.SequenceOrder))
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.SequenceOrder))
                .OrderBy(q => q.Title)
                .ToListAsync();

            return quizzes.Select(quiz => new QuizDto
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
                    QuestionType = q.QuestionType ?? "MultipleChoice",
                    Points = q.Points,
                    Options = q.Options.Select(o => new QuestionOptionDto
                    {
                        OptionId = o.OptionId,
                        OptionText = o.OptionText
                    }).ToList()
                }).ToList()
            });
        }

        #endregion

        #region Admin Quiz Management

        public async Task<QuizDto?> CreateQuizAsync(CreateQuizRequestDto request)
        {
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == request.CourseId);
            if (course == null)
                return null;

            var quiz = new Quiz
            {
                CourseId = request.CourseId,
                ModuleId = request.ModuleId,
                Title = request.Title,
                Description = request.Description,
                TotalQuestions = request.Questions.Count,
                PassingPercentage = request.PassingPercentage,
                DurationMinutes = request.DurationMinutes,
                AllowRetake = request.AllowRetake,
                MaxAttempts = request.MaxAttempts,
                Status = "Draft"
            };

            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();

            // Add questions and options
            var questionNumber = 1;
            foreach (var questionDto in request.Questions)
            {
                var question = new Question
                {
                    QuizId = quiz.QuizId,
                    QuestionText = questionDto.QuestionText,
                    QuestionType = questionDto.QuestionType,
                    Points = questionDto.Points,
                    SequenceOrder = questionNumber++
                };

                _context.Questions.Add(question);
                await _context.SaveChangesAsync();

                var optionNumber = 1;
                foreach (var optionDto in questionDto.Options)
                {
                    var option = new QuestionOption
                    {
                        QuestionId = question.QuestionId,
                        OptionText = optionDto.OptionText,
                        IsCorrect = optionDto.IsCorrect,
                        SequenceOrder = optionNumber++
                    };

                    _context.QuestionOptions.Add(option);
                }
            }

            await _context.SaveChangesAsync();

            return await GetQuizByIdAsync(quiz.QuizId);
        }

        public async Task<QuizDto?> UpdateQuizAsync(int quizId, UpdateQuizRequestDto request)
        {
            var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.QuizId == quizId);
            if (quiz == null)
                return null;

            if (!string.IsNullOrEmpty(request.Title))
                quiz.Title = request.Title;

            if (request.Description != null)
                quiz.Description = request.Description;

            if (request.CourseId.HasValue)
                quiz.CourseId = request.CourseId.Value;

            if (request.PassingPercentage.HasValue)
                quiz.PassingPercentage = request.PassingPercentage.Value;

            if (request.DurationMinutes.HasValue)
                quiz.DurationMinutes = request.DurationMinutes.Value;

            if (request.AllowRetake.HasValue)
                quiz.AllowRetake = request.AllowRetake.Value;

            if (request.MaxAttempts.HasValue)
                quiz.MaxAttempts = request.MaxAttempts.Value;

            if (request.IsActive.HasValue)
                quiz.Status = request.IsActive.Value ? "Published" : "Draft";

            quiz.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetQuizByIdAsync(quizId);
        }

        public async Task<bool> DeleteQuizAsync(int quizId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Options)
                .Include(q => q.QuizAttempts)
                    .ThenInclude(a => a.StudentAnswers)
                .FirstOrDefaultAsync(q => q.QuizId == quizId);

            if (quiz == null)
                return false;

            // Delete related entities in correct order to handle foreign key constraints

            // 1. Delete all student answers for quiz attempts
            foreach (var attempt in quiz.QuizAttempts)
            {
                _context.StudentAnswers.RemoveRange(attempt.StudentAnswers);
            }

            // 2. Delete quiz attempts
            _context.QuizAttempts.RemoveRange(quiz.QuizAttempts);

            // 3. Delete question options
            foreach (var question in quiz.Questions)
            {
                _context.QuestionOptions.RemoveRange(question.Options);
            }

            // 4. Delete questions
            _context.Questions.RemoveRange(quiz.Questions);

            // 5. Delete quiz
            _context.Quizzes.Remove(quiz);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> PublishQuizAsync(int quizId)
        {
            var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.QuizId == quizId);
            if (quiz == null)
                return false;

            quiz.Status = "Published";
            quiz.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnpublishQuizAsync(int quizId)
        {
            var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.QuizId == quizId);
            if (quiz == null)
                return false;

            quiz.Status = "Draft";
            quiz.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<QuizListDto>> GetAllQuizzesAsync()
        {
            var quizzes = await _context.Quizzes
                .Include(q => q.Questions.OrderBy(qu => qu.SequenceOrder))
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.SequenceOrder))
                .Include(q => q.Course)
                .OrderBy(q => q.Title)
                .ToListAsync();

            return quizzes.Select(quiz => new QuizListDto
            {
                QuizId = quiz.QuizId,
                Title = quiz.Title,
                Description = quiz.Description,
                CourseTitle = quiz.Course?.Title ?? "Unknown Course",
                CourseId = quiz.CourseId,
                QuestionCount = quiz.TotalQuestions,
                PassingScore = quiz.PassingPercentage,
                TimeLimit = quiz.DurationMinutes,
                MaxAttempts = quiz.MaxAttempts,
                IsActive = quiz.Status == "Published",
                CreatedAt = quiz.CreatedAt,
                UpdatedAt = quiz.UpdatedAt
            });
        }

        public async Task<IEnumerable<QuizDto>> GetAllQuizzesForCourseAsync(int courseId)
        {
            var quizzes = await _context.Quizzes
                .Where(q => q.CourseId == courseId)
                .Include(q => q.Questions.OrderBy(qu => qu.SequenceOrder))
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.SequenceOrder))
                .OrderBy(q => q.Title)
                .ToListAsync();

            return quizzes.Select(quiz => new QuizDto
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
                    QuestionType = q.QuestionType ?? "MultipleChoice",
                    Points = q.Points,
                    Options = q.Options.Select(o => new QuestionOptionDto
                    {
                        OptionId = o.OptionId,
                        OptionText = o.OptionText
                    }).ToList()
                }).ToList()
            });
        }

        #endregion

        #region Quiz Attempts

        public async Task<QuizAttemptResponseDto> StartQuizAsync(int studentId, int quizId)
        {
            var quiz = await _context.Quizzes
                .FirstOrDefaultAsync(q => q.QuizId == quizId);

            if (quiz == null)
                throw new InvalidOperationException("Quiz not found");

            if (quiz.Status != "Published")
                throw new InvalidOperationException("Quiz is not available for submission");

            // Check enrollment
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == quiz.CourseId);

            if (enrollment == null)
                throw new UnauthorizedAccessException("Not enrolled in this course");

            // Check if student can retake
            if (!await CanStudentRetakeQuizAsync(studentId, quizId))
                throw new InvalidOperationException("Maximum attempts reached or quiz not eligible for retake");

            // Check for existing in-progress attempts
            var existingAttempt = await _context.QuizAttempts
                .FirstOrDefaultAsync(qa => qa.StudentId == studentId && qa.QuizId == quizId && qa.Status == "InProgress");

            if (existingAttempt != null)
            {
                // Return existing attempt if still valid
                var timeRemaining = quiz.DurationMinutes.HasValue
                    ? quiz.DurationMinutes.Value - (int)(DateTime.UtcNow - existingAttempt.StartedAt).TotalMinutes
                    : 0;

                if (timeRemaining > 0)
                {
                    return new QuizAttemptResponseDto
                    {
                        AttemptId = existingAttempt.AttemptId,
                        QuizId = quizId,
                        QuizTitle = quiz.Title,
                        StartedAt = existingAttempt.StartedAt,
                        ExpiresAt = existingAttempt.StartedAt.AddMinutes(quiz.DurationMinutes ?? 60),
                        DurationMinutes = quiz.DurationMinutes ?? 60,
                        TotalQuestions = quiz.TotalQuestions,
                        AttemptsUsed = await _context.QuizAttempts.CountAsync(qa => qa.StudentId == studentId && qa.QuizId == quizId),
                        MaxAttempts = quiz.MaxAttempts,
                        CanRetake = await CanStudentRetakeQuizAsync(studentId, quizId)
                    };
                }
                else
                {
                    // Mark existing attempt as expired
                    existingAttempt.Status = "Expired";
                    await _context.SaveChangesAsync();
                }
            }

            // Create new quiz attempt
            var attempt = new QuizAttempt
            {
                QuizId = quizId,
                StudentId = studentId,
                CourseId = quiz.CourseId,
                StartedAt = DateTime.UtcNow,
                Status = "InProgress"
            };

            _context.QuizAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            var attemptsUsed = await _context.QuizAttempts
                .CountAsync(qa => qa.StudentId == studentId && qa.QuizId == quizId);

            return new QuizAttemptResponseDto
            {
                AttemptId = attempt.AttemptId,
                QuizId = quizId,
                QuizTitle = quiz.Title,
                StartedAt = attempt.StartedAt,
                ExpiresAt = attempt.StartedAt.AddMinutes(quiz.DurationMinutes ?? 60),
                DurationMinutes = quiz.DurationMinutes ?? 60,
                TotalQuestions = quiz.TotalQuestions,
                AttemptsUsed = attemptsUsed,
                MaxAttempts = quiz.MaxAttempts,
                CanRetake = await CanStudentRetakeQuizAsync(studentId, quizId)
            };
        }

        public async Task<QuizAttemptResponseDto> StartQuizAttemptAsync(int quizId, int studentId)
        {
            return await StartQuizAsync(studentId, quizId);
        }

        public async Task<QuizResultDto?> SubmitQuizAttemptAsync(int attemptId, int studentId, IEnumerable<SubmitAnswerDto> answers)
        {
            var attempt = await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                    .ThenInclude(q => q.Questions)
                        .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(qa => qa.AttemptId == attemptId && qa.StudentId == studentId);

            if (attempt == null)
                return null;

            if (attempt.Status != "InProgress")
                throw new InvalidOperationException("Quiz attempt is not in progress");

            if (attempt.Quiz.Status != "Published")
                throw new InvalidOperationException("Quiz is not available for submission");

            // Grade the quiz
            int totalScore = 0;
            int maxScore = attempt.Quiz.Questions.Sum(q => q.Points);

            foreach (var answer in answers)
            {
                var question = attempt.Quiz.Questions.FirstOrDefault(q => q.QuestionId == answer.QuestionId);
                if (question == null) continue;

                var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                bool isCorrect = correctOption != null && correctOption.OptionId == answer.SelectedOptionId;

                var studentAnswer = new StudentAnswer
                {
                    AttemptId = attemptId,
                    QuestionId = answer.QuestionId,
                    SelectedOptionId = answer.SelectedOptionId,
                    AnswerText = answer.AnswerText,
                    IsCorrect = isCorrect
                };

                _context.StudentAnswers.Add(studentAnswer);
                if (isCorrect) totalScore += question.Points;
            }

            // Update attempt with scores
            attempt.TotalScore = totalScore;
            attempt.MaxScore = maxScore;
            attempt.PercentageScore = maxScore > 0 ? (decimal)totalScore / maxScore * 100 : 0;
            attempt.CompletedAt = DateTime.UtcNow;
            attempt.Status = "Graded";

            await _context.SaveChangesAsync();

            // If quiz is passed, update enrollment status to completed and issue certificate
            var isPassed = attempt.PercentageScore >= attempt.Quiz.PassingPercentage;
            var certificateIssued = false;

            if (isPassed)
            {
                var enrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == attempt.Quiz.CourseId);

                if (enrollment != null)
                {
                    enrollment.Status = "Completed";
                    enrollment.ProgressPercentage = 100;
                    enrollment.CompletedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Issue certificate for course completion
                    try
                    {
                        await _certificateService.IssueCertificateAsync(studentId, attempt.Quiz.CourseId);
                        certificateIssued = true;
                    }
                    catch (Exception ex)
                    {
                        // Log error but don't fail the quiz submission
                        Console.WriteLine($"Failed to issue certificate: {ex.Message}");
                    }
                }
            }

            return await CreateQuizResultDto(attempt, attempt.Quiz, certificateIssued);
        }

        public async Task<QuizResultDto> SubmitQuizAsync(int studentId, QuizSubmissionRequest submission)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(q => q.QuizId == submission.QuizId);

            if (quiz == null)
                throw new InvalidOperationException("Quiz not found");

            if (quiz.Status != "Published")
                throw new InvalidOperationException("Quiz is not available for submission");

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

            if (submission.Answers.Count == 0)
                throw new InvalidOperationException("No answers provided");

            if (submission.Answers.Count != quiz.Questions.Count)
                throw new InvalidOperationException("Number of answers does not match number of questions");

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
            attempt.Status = "Graded";
            // IsPassed is calculated from PercentageScore >= PassingPercentage

            await _context.SaveChangesAsync();

            // If quiz is passed, update enrollment status to completed and issue certificate
            var isPassed = attempt.PercentageScore >= quiz.PassingPercentage;
            var certificateIssued = false;

            if (isPassed)
            {
                var studentEnrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == quiz.CourseId);

                if (studentEnrollment != null)
                {
                    studentEnrollment.Status = "Completed";
                    studentEnrollment.ProgressPercentage = 100;
                    studentEnrollment.CompletedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Issue certificate for course completion
                    try
                    {
                        await _certificateService.IssueCertificateAsync(studentId, quiz.CourseId);
                        certificateIssued = true;
                    }
                    catch (Exception ex)
                    {
                        // Log error but don't fail the quiz submission
                        Console.WriteLine($"Failed to issue certificate: {ex.Message}");
                    }
                }
            }

            return await CreateQuizResultDto(attempt, quiz, certificateIssued);
        }

        public async Task<QuizResultDto?> GetQuizAttemptAsync(int attemptId, int studentId)
        {
            var attempt = await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .FirstOrDefaultAsync(qa => qa.AttemptId == attemptId && qa.StudentId == studentId);

            if (attempt == null)
                return null;

            return await CreateQuizResultDto(attempt, attempt.Quiz);
        }

        public async Task<IEnumerable<QuizResultDto>> GetStudentQuizAttemptsAsync(int studentId)
        {
            var attempts = await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Where(qa => qa.StudentId == studentId)
                .OrderByDescending(qa => qa.StartedAt)
                .ToListAsync();

            var results = new List<QuizResultDto>();
            foreach (var attempt in attempts)
            {
                results.Add(await CreateQuizResultDto(attempt, attempt.Quiz));
            }

            return results;
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

        public async Task<bool> CanStudentRetakeQuizAsync(int studentId, int quizId)
        {
            var quiz = await _context.Quizzes
                .FirstOrDefaultAsync(q => q.QuizId == quizId);

            if (quiz == null)
                return false;

            if (!quiz.AllowRetake)
                return false;

            // Check if student has already passed this quiz
            var hasPassed = await _context.QuizAttempts
                .AnyAsync(qa => qa.StudentId == studentId && qa.QuizId == quizId &&
                               qa.Status == "Graded" && qa.PercentageScore >= quiz.PassingPercentage);

            if (hasPassed)
                return false; // Cannot retake if already passed

            var attemptCount = await _context.QuizAttempts
                .CountAsync(qa => qa.StudentId == studentId && qa.QuizId == quizId && qa.Status == "Graded");

            return attemptCount < quiz.MaxAttempts;
        }

        #endregion

        #region Helper Methods

        private async Task<QuizResultDto> CreateQuizResultDto(QuizAttempt attempt, Quiz quiz, bool certificateIssued = false)
        {
            var attemptCount = await _context.QuizAttempts
                .CountAsync(qa => qa.StudentId == attempt.StudentId && qa.QuizId == attempt.QuizId);

            var isPassed = attempt.PercentageScore >= quiz.PassingPercentage;

            // Get question results
            var questionResults = await GetQuestionResultsForAttemptAsync(attempt.AttemptId);

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
                CanRetake = attemptCount < quiz.MaxAttempts,
                CertificateIssued = certificateIssued,
                QuestionResults = questionResults
            };
        }

        private async Task<List<QuestionResultDto>> GetQuestionResultsForAttemptAsync(int attemptId)
        {
            var studentAnswers = await _context.StudentAnswers
                .Include(sa => sa.Question)
                    .ThenInclude(q => q.Options)
                .Where(sa => sa.AttemptId == attemptId)
                .ToListAsync();

            var questionResults = new List<QuestionResultDto>();

            foreach (var answer in studentAnswers)
            {
                var question = answer.Question;
                var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                var selectedOption = question.Options.FirstOrDefault(o => o.OptionId == answer.SelectedOptionId);

                var studentAnswerText = selectedOption?.OptionText ?? answer.AnswerText ?? "Not answered";
                var correctAnswerText = correctOption?.OptionText ?? "No correct answer";

                questionResults.Add(new QuestionResultDto
                {
                    QuestionId = question.QuestionId,
                    QuestionText = question.QuestionText,
                    StudentAnswer = studentAnswerText,
                    CorrectAnswer = correctAnswerText,
                    IsCorrect = answer.IsCorrect ?? false,
                    PointsEarned = (answer.IsCorrect ?? false) ? question.Points : 0,
                    PointsTotal = question.Points
                });
            }

            return questionResults.OrderBy(qr => qr.QuestionId).ToList();
        }

        #endregion
    }
}
