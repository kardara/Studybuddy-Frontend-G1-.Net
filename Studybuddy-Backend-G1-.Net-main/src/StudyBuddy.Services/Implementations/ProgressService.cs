using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Responses;
using StudyBuddy.Data;

namespace StudyBuddy.Services.Implementations
{
    public class ProgressService : IProgressService
    {
        private readonly AppDbContext _context;

        public ProgressService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> UpdateProgressAsync(int studentId, int lessonId, bool isCompleted)
        {
            // Get lesson and course info
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.LessonId == lessonId);

            if (lesson == null)
                return false;

            // Check enrollment
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.StudentId == studentId && e.CourseId == lesson.CourseId);

            if (!isEnrolled)
                throw new UnauthorizedAccessException("Student is not enrolled in this course");

            // Find or create progress record
            var progress = await _context.StudentProgresses
                .FirstOrDefaultAsync(sp => sp.StudentId == studentId && sp.LessonId == lessonId);

            if (progress == null)
            {
                progress = new StudentProgress
                {
                    StudentId = studentId,
                    LessonId = lessonId,
                    CourseId = lesson.CourseId,
                    IsCompleted = isCompleted,
                    CompletedAt = isCompleted ? DateTime.UtcNow : null,
                    LastAccessedAt = DateTime.UtcNow
                };
                _context.StudentProgresses.Add(progress);
            }
            else
            {
                progress.IsCompleted = isCompleted;
                progress.CompletedAt = isCompleted ? DateTime.UtcNow : null;
                progress.LastAccessedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Update enrollment progress percentage
            await UpdateEnrollmentProgressAsync(studentId, lesson.CourseId);

            return true;
        }

        public async Task<ProgressResponse?> GetCourseProgressAsync(int studentId, int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Lessons)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                return null;

            var completedLessons = await _context.StudentProgresses
                .CountAsync(sp => sp.StudentId == studentId && 
                    sp.CourseId == courseId && 
                    sp.IsCompleted);

            var lastAccessed = await _context.StudentProgresses
                .Where(sp => sp.StudentId == studentId && sp.CourseId == courseId)
                .MaxAsync(sp => (DateTime?)sp.LastAccessedAt);

            var totalLessons = course.Lessons.Count;
            var progressPercentage = totalLessons > 0 
                ? (decimal)completedLessons / totalLessons * 100 
                : 0;

            return new ProgressResponse
            {
                CourseId = courseId,
                CourseTitle = course.Title,
                TotalLessons = totalLessons,
                CompletedLessons = completedLessons,
                ProgressPercentage = Math.Round(progressPercentage, 2),
                LastAccessedAt = lastAccessed
            };
        }

        public async Task<IEnumerable<ProgressResponse>> GetStudentProgressAsync(int studentId)
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                    .ThenInclude(c => c.Lessons)
                .Where(e => e.StudentId == studentId)
                .ToListAsync();

            var progressList = new List<ProgressResponse>();

            foreach (var enrollment in enrollments)
            {
                var completedLessons = await _context.StudentProgresses
                    .CountAsync(sp => sp.StudentId == studentId && 
                        sp.CourseId == enrollment.CourseId && 
                        sp.IsCompleted);

                var lastAccessed = await _context.StudentProgresses
                    .Where(sp => sp.StudentId == studentId && sp.CourseId == enrollment.CourseId)
                    .MaxAsync(sp => (DateTime?)sp.LastAccessedAt);

                var totalLessons = enrollment.Course.Lessons.Count;
                var progressPercentage = totalLessons > 0 
                    ? (decimal)completedLessons / totalLessons * 100 
                    : 0;

                progressList.Add(new ProgressResponse
                {
                    CourseId = enrollment.CourseId,
                    CourseTitle = enrollment.Course.Title,
                    TotalLessons = totalLessons,
                    CompletedLessons = completedLessons,
                    ProgressPercentage = Math.Round(progressPercentage, 2),
                    LastAccessedAt = lastAccessed
                });
            }

            return progressList;
        }

        private async Task UpdateEnrollmentProgressAsync(int studentId, int courseId)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                    .ThenInclude(c => c.Lessons)
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

            if (enrollment == null)
                return;

            var totalLessons = enrollment.Course.Lessons.Count;
            var completedLessons = await _context.StudentProgresses
                .CountAsync(sp => sp.StudentId == studentId && 
                    sp.CourseId == courseId && 
                    sp.IsCompleted);

            enrollment.ProgressPercentage = totalLessons > 0 
                ? (decimal)completedLessons / totalLessons * 100 
                : 0;

            if (enrollment.ProgressPercentage >= 100)
            {
                enrollment.Status = "Completed";
                enrollment.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }
    }
}
