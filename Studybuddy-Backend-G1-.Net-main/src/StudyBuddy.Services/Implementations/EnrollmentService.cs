using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Responses;
using StudyBuddy.Data;

namespace StudyBuddy.Services.Implementations
{
    public class EnrollmentService : IEnrollmentService
    {
        private readonly AppDbContext _context;

        public EnrollmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<EnrollmentResponse> EnrollStudentAsync(int studentId, int courseId)
        {
            // Check if already enrolled
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

            if (existingEnrollment != null)
                throw new InvalidOperationException("Student is already enrolled in this course");

            // Check if course exists and is published
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.Status == "Published");

            if (course == null)
                throw new InvalidOperationException("Course not found or not available");

            var enrollment = new Enrollment
            {
                StudentId = studentId,
                CourseId = courseId,
                EnrolledAt = DateTime.UtcNow,
                Status = "Active",
                ProgressPercentage = 0
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return new EnrollmentResponse
            {
                EnrollmentId = enrollment.EnrollmentId,
                CourseId = course.CourseId,
                CourseTitle = course.Title,
                EnrolledAt = enrollment.EnrolledAt,
                Status = enrollment.Status,
                ProgressPercentage = enrollment.ProgressPercentage
            };
        }

        public async Task<IEnumerable<EnrollmentResponse>> GetStudentEnrollmentsAsync(int studentId)
        {
            return await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.StudentId == studentId)
                .Select(e => new EnrollmentResponse
                {
                    EnrollmentId = e.EnrollmentId,
                    CourseId = e.CourseId,
                    CourseTitle = e.Course.Title,
                    EnrolledAt = e.EnrolledAt,
                    Status = e.Status,
                    ProgressPercentage = e.ProgressPercentage
                })
                .OrderByDescending(e => e.EnrolledAt)
                .ToListAsync();
        }

        public async Task<bool> CheckEnrollmentAsync(int studentId, int courseId)
        {
            return await _context.Enrollments
                .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);
        }
    }
}
