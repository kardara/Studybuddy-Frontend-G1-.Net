using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.DTOs.Responses;
using StudyBuddy.Data;

namespace StudyBuddy.Services.Implementations
{
    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseService(AppDbContext context)
        {
            _context = context;
        }

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
                        Content = null, // Only show content if preview
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
    }
}
