using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using StudyBuddy.Data;

namespace StudyBuddy.Services.Implementations
{
    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CourseService> _logger;

        public CourseService(AppDbContext context, ILogger<CourseService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Public Course Access

        public async Task<IEnumerable<CourseListDto>> GetPublishedCoursesAsync()
        {
            return await _context.Courses
                .Where(c => c.Status == "Published")
                .Select(c => new CourseListDto
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Level = "",
                    Category = c.Category,
                    EstimatedDurationHours = (int?)c.DurationHours,
                    CreatedAt = c.CreatedAt,
                    EnrollmentCount = c.Enrollments.Count
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<CourseDetailDto?> GetCourseByIdAsync(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Modules.OrderBy(m => m.SequenceOrder))
                    .ThenInclude(m => m.Lessons.OrderBy(l => l.SequenceOrder))
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.Status == "Published");

            if (course == null)
                return null;

            return new CourseDetailDto
            {
                CourseId = course.CourseId,
                Title = course.Title,
                Description = course.Description,
                ThumbnailUrl = course.ThumbnailUrl,
                Level = "",
                Category = course.Category,
                EstimatedDurationHours = (int?)course.DurationHours,
                Prerequisites = null,
                LearningObjectives = null,
                IsPublished = course.Status == "Published",
                CreatedAt = course.CreatedAt,
                EnrollmentCount = course.Enrollments.Count,
                Modules = course.Modules.Select(m => new ModuleDto
                {
                    ModuleId = m.ModuleId,
                    Title = m.Title,
                    Description = m.Description,
                    ModuleNumber = m.ModuleNumber,
                    EstimatedDurationMinutes = m.EstimatedDurationMinutes,
                    SequenceOrder = m.SequenceOrder,
                    Lessons = m.Lessons.Select(l => new LessonDto
                    {
                        LessonId = l.LessonId,
                        Title = l.Title,
                        Content = l.Content, // Include content for student viewing
                        VideoUrl = l.VideoUrl,
                        LessonNumber = l.LessonNumber,
                        LessonType = l.ContentType ?? "Text",
                        EstimatedDurationMinutes = l.EstimatedDurationMinutes,
                        SequenceOrder = l.SequenceOrder,
                        IsPreview = false
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<IEnumerable<CourseListDto>> SearchCoursesAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return await GetPublishedCoursesAsync();

            query = query.ToLower();

            return await _context.Courses
                .Where(c => c.Status == "Published" &&
                    (c.Title.ToLower().Contains(query) || 
                     c.Description!.ToLower().Contains(query) ||
                     c.Category!.ToLower().Contains(query)))
                .Select(c => new CourseListDto
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Level = "",
                    Category = c.Category,
                    EstimatedDurationHours = (int?)c.DurationHours,
                    CreatedAt = c.CreatedAt,
                    EnrollmentCount = c.Enrollments.Count
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        #endregion

        #region Admin Course Management

        public async Task<CourseDetailDto?> CreateCourseAsync(CreateCourseRequestDto request)
        {
            var course = new Course
            {
                Title = request.Title,
                Description = request.Description,
                Category = request.Category,
                Status = "Draft",
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return await GetCourseDetailsForAdminAsync(course.CourseId);
        }

        public async Task<CourseDetailDto?> UpdateCourseAsync(int courseId, UpdateCourseRequestDto request)
        {
            var course = await _context.Courses
                .Include(c => c.Modules.OrderBy(m => m.SequenceOrder))
                    .ThenInclude(m => m.Lessons.OrderBy(l => l.SequenceOrder))
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                return null;

            course.Title = request.Title;
            course.Description = request.Description;
            course.Category = request.Category;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCourseDetailsForAdminAsync(courseId);
        }

        public async Task<bool> PublishCourseAsync(int courseId)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                return false;

            course.Status = "Published";
            course.PublishedAt = DateTime.UtcNow;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnpublishCourseAsync(int courseId)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                return false;

            course.Status = "Draft";
            course.PublishedAt = null;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCourseAsync(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                return false;

            // Check if course has enrollments
            if (course.Enrollments.Any())
            {
                throw new InvalidOperationException("Cannot delete course with existing enrollments");
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CourseListDto>> GetAllCoursesAsync()
        {
            return await _context.Courses
                .Select(c => new CourseListDto
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Level = "",
                    Category = c.Category,
                    EstimatedDurationHours = (int?)c.DurationHours,
                    CreatedAt = c.CreatedAt,
                    EnrollmentCount = c.Enrollments.Count
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<CourseDetailDto?> GetCourseDetailsForAdminAsync(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Modules.OrderBy(m => m.SequenceOrder))
                    .ThenInclude(m => m.Lessons.OrderBy(l => l.SequenceOrder))
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                return null;

            return new CourseDetailDto
            {
                CourseId = course.CourseId,
                Title = course.Title,
                Description = course.Description,
                ThumbnailUrl = course.ThumbnailUrl,
                Level = "",
                Category = course.Category,
                EstimatedDurationHours = (int?)course.DurationHours,
                Prerequisites = null,
                LearningObjectives = null,
                IsPublished = course.Status == "Published",
                CreatedAt = course.CreatedAt,
                EnrollmentCount = course.Enrollments.Count,
                Modules = course.Modules.Select(m => new ModuleDto
                {
                    ModuleId = m.ModuleId,
                    Title = m.Title,
                    Description = m.Description,
                    ModuleNumber = m.ModuleNumber,
                    EstimatedDurationMinutes = m.EstimatedDurationMinutes,
                    SequenceOrder = m.SequenceOrder,
                    Lessons = m.Lessons.Select(l => new LessonDto
                    {
                        LessonId = l.LessonId,
                        Title = l.Title,
                        Content = l.Content, // Show full content for admin
                        LessonNumber = l.LessonNumber,
                        LessonType = l.ContentType ?? "Text",
                        EstimatedDurationMinutes = l.EstimatedDurationMinutes,
                        SequenceOrder = l.SequenceOrder,
                        IsPreview = false
                    }).ToList()
                }).ToList()
            };
        }

        #endregion

        #region Course Content Management

        public async Task<ModuleDto?> CreateModuleAsync(int courseId, CreateModuleRequestDto request)
        {
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
            if (course == null)
                return null;

            var module = new Module
            {
                CourseId = courseId,
                ModuleNumber = request.ModuleNumber,
                Title = request.Title,
                Description = request.Description,
                EstimatedDurationMinutes = request.EstimatedDurationMinutes,
                SequenceOrder = request.SequenceOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.Modules.Add(module);
            await _context.SaveChangesAsync();

            return new ModuleDto
            {
                ModuleId = module.ModuleId,
                Title = module.Title,
                Description = module.Description,
                ModuleNumber = module.ModuleNumber,
                EstimatedDurationMinutes = module.EstimatedDurationMinutes,
                SequenceOrder = module.SequenceOrder,
                Lessons = new List<LessonDto>()
            };
        }

        public async Task<ModuleDto?> GetModuleAsync(int courseId, int moduleId)
        {
            var module = await _context.Modules
                .Include(m => m.Lessons.OrderBy(l => l.SequenceOrder))
                .FirstOrDefaultAsync(m => m.ModuleId == moduleId && m.CourseId == courseId);

            if (module == null)
                return null;

            return new ModuleDto
            {
                ModuleId = module.ModuleId,
                Title = module.Title,
                Description = module.Description,
                ModuleNumber = module.ModuleNumber,
                EstimatedDurationMinutes = module.EstimatedDurationMinutes,
                SequenceOrder = module.SequenceOrder,
                Lessons = module.Lessons.Select(l => new LessonDto
                {
                    LessonId = l.LessonId,
                    Title = l.Title,
                    Content = l.Content,
                    LessonNumber = l.LessonNumber,
                    LessonType = l.ContentType ?? "Text",
                    EstimatedDurationMinutes = l.EstimatedDurationMinutes,
                    SequenceOrder = l.SequenceOrder,
                    IsPreview = false
                }).ToList()
            };
        }

        public async Task<LessonDto?> CreateLessonAsync(int courseId, int moduleId, CreateLessonRequestDto request)
        {
            var module = await _context.Modules.FirstOrDefaultAsync(m => m.ModuleId == moduleId && m.CourseId == courseId);
            if (module == null)
                return null;

            var lesson = new Lesson
            {
                ModuleId = moduleId,
                CourseId = courseId,
                LessonNumber = request.LessonNumber,
                Title = request.Title,
                Content = request.Content,
                ContentType = request.ContentType,
                VideoUrl = request.VideoUrl,
                EstimatedDurationMinutes = request.EstimatedDurationMinutes,
                SequenceOrder = request.SequenceOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            return new LessonDto
            {
                LessonId = lesson.LessonId,
                Title = lesson.Title,
                Content = lesson.Content,
                LessonNumber = lesson.LessonNumber,
                LessonType = lesson.ContentType ?? "Text",
                EstimatedDurationMinutes = lesson.EstimatedDurationMinutes,
                SequenceOrder = lesson.SequenceOrder,
                IsPreview = false
            };
        }

        public async Task<LessonDto?> GetLessonAsync(int courseId, int moduleId, int lessonId)
        {
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.LessonId == lessonId && l.ModuleId == moduleId && l.CourseId == courseId);

            if (lesson == null)
                return null;

            return new LessonDto
            {
                LessonId = lesson.LessonId,
                Title = lesson.Title,
                Content = lesson.Content,
                LessonNumber = lesson.LessonNumber,
                LessonType = lesson.ContentType ?? "Text",
                EstimatedDurationMinutes = lesson.EstimatedDurationMinutes,
                SequenceOrder = lesson.SequenceOrder,
                IsPreview = false
            };
        }

        #endregion

        #region Bulk Content Retrieval

        public async Task<IEnumerable<ModuleDto>> GetAllModulesForCourseAsync(int courseId)
        {
            var modules = await _context.Modules
                .Where(m => m.CourseId == courseId)
                .OrderBy(m => m.SequenceOrder)
                .Include(m => m.Lessons.OrderBy(l => l.SequenceOrder))
                .ToListAsync();

            return modules.Select(m => new ModuleDto
            {
                ModuleId = m.ModuleId,
                Title = m.Title,
                Description = m.Description,
                ModuleNumber = m.ModuleNumber,
                EstimatedDurationMinutes = m.EstimatedDurationMinutes,
                SequenceOrder = m.SequenceOrder,
                Lessons = m.Lessons.Select(l => new LessonDto
                {
                    LessonId = l.LessonId,
                    Title = l.Title,
                    Content = l.Content,
                    LessonNumber = l.LessonNumber,
                    LessonType = l.ContentType ?? "Text",
                    EstimatedDurationMinutes = l.EstimatedDurationMinutes,
                    SequenceOrder = l.SequenceOrder,
                    IsPreview = false
                }).ToList()
            }).ToList();
        }

        public async Task<IEnumerable<LessonDto>> GetAllLessonsForModuleAsync(int courseId, int moduleId)
        {
            var lessons = await _context.Lessons
                .Where(l => l.CourseId == courseId && l.ModuleId == moduleId)
                .OrderBy(l => l.SequenceOrder)
                .ToListAsync();

            return lessons.Select(l => new LessonDto
            {
                LessonId = l.LessonId,
                Title = l.Title,
                Content = l.Content,
                LessonNumber = l.LessonNumber,
                LessonType = l.ContentType ?? "Text",
                EstimatedDurationMinutes = l.EstimatedDurationMinutes,
                SequenceOrder = l.SequenceOrder,
                IsPreview = false
            }).ToList();
        }

        #endregion

        #region Quiz Management

        public async Task<QuizDto?> CreateQuizAsync(CreateQuizRequestDto request)
        {
            try
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
                    Status = "Published",
                    AllowRetake = request.AllowRetake,
                    MaxAttempts = request.MaxAttempts,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Quizzes.Add(quiz);
                await _context.SaveChangesAsync();

                // Add questions and options
                foreach (var questionDto in request.Questions.Select((q, index) => new { q, index }))
                {
                    var question = new Question
                    {
                        QuizId = quiz.QuizId,
                        QuestionText = questionDto.q.QuestionText,
                        QuestionType = questionDto.q.QuestionType,
                        Points = questionDto.q.Points,
                        SequenceOrder = questionDto.index + 1,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Questions.Add(question);
                    await _context.SaveChangesAsync();

                    // Add options
                    foreach (var optionDto in questionDto.q.Options.Select((o, optIndex) => new { o, optIndex }))
                    {
                        var option = new QuestionOption
                        {
                            QuestionId = question.QuestionId,
                            OptionText = optionDto.o.OptionText,
                            IsCorrect = optionDto.o.IsCorrect,
                            SequenceOrder = optionDto.optIndex + 1
                        };

                        _context.QuestionOptions.Add(option);
                    }
                }

                await _context.SaveChangesAsync();

                // Return the created quiz
                return new QuizDto
                {
                    QuizId = quiz.QuizId,
                    CourseId = quiz.CourseId,
                    ModuleId = quiz.ModuleId,
                    Title = quiz.Title,
                    Description = quiz.Description,
                    TotalQuestions = quiz.TotalQuestions,
                    PassingPercentage = quiz.PassingPercentage,
                    DurationMinutes = quiz.DurationMinutes,
                    Status = quiz.Status,
                    AllowRetake = quiz.AllowRetake,
                    MaxAttempts = quiz.MaxAttempts,
                    CreatedAt = quiz.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quiz for course {CourseId}", request.CourseId);
                throw;
            }
        }

        #endregion
    }
}
