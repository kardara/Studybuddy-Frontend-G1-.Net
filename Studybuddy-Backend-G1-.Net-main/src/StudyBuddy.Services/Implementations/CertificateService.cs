using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Responses;
using StudyBuddy.Data;

namespace StudyBuddy.Services.Implementations
{
    public class CertificateService : ICertificateService
    {
        private readonly AppDbContext _context;

        public CertificateService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CertificateDto?> IssueCertificateAsync(int studentId, int courseId)
        {
            // Check if already has certificate
            var existingCert = await _context.Certificates
                .FirstOrDefaultAsync(c => c.StudentId == studentId && c.CourseId == courseId);

            if (existingCert != null)
                throw new InvalidOperationException("Certificate already issued for this course");

            // Check enrollment completion
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

            if (enrollment == null)
                throw new InvalidOperationException("Not enrolled in this course");

            if (enrollment.Status != "Completed" || enrollment.ProgressPercentage < 100)
                throw new InvalidOperationException("Course not completed yet");

            // Get student and course info
            var student = await _context.Users.FindAsync(studentId);
            var course = await _context.Courses.FindAsync(courseId);

            if (student == null || course == null)
                throw new InvalidOperationException("Student or course not found");

            // Generate certificate number
            var certNumber = $"CERT-{course.CourseId:D4}-{studentId:D6}-{DateTime.UtcNow:yyyyMMdd}";

            var certificate = new Certificate
            {
                StudentId = studentId,
                CourseId = courseId,
                CertificateNumber = certNumber,
                IssuedAt = DateTime.UtcNow,
                CertificateUrl = $"/certificates/{certNumber}.pdf" // Placeholder
            };

            _context.Certificates.Add(certificate);
            await _context.SaveChangesAsync();

            return new CertificateDto
            {
                CertificateId = certificate.CertificateId,
                CertificateNumber = certificate.CertificateNumber,
                StudentId = studentId,
                StudentName = $"{student.FirstName} {student.LastName}",
                CourseId = courseId,
                CourseTitle = course.Title,
                IssuedAt = certificate.IssuedAt,
                CertificateUrl = certificate.CertificateUrl
            };
        }

        public async Task<IEnumerable<CertificateDto>> GetStudentCertificatesAsync(int studentId)
        {
            return await _context.Certificates
                .Include(c => c.Student)
                .Include(c => c.Course)
                .Where(c => c. StudentId == studentId)
                .Select(c => new CertificateDto
                {
                    CertificateId = c.CertificateId,
                    CertificateNumber = c.CertificateNumber,
                    StudentId = c.StudentId,
                    StudentName = $"{c.Student.FirstName} {c.Student.LastName}",
                    CourseId = c.CourseId,
                    CourseTitle = c.Course.Title,
                    IssuedAt = c.IssuedAt,
                    CertificateUrl = c.CertificateUrl
                })
                .OrderByDescending(c => c.IssuedAt)
                .ToListAsync();
        }

        public async Task<CertificateDto?> GetCertificateByNumberAsync(string certificateNumber)
        {
            var certificate = await _context.Certificates
                .Include(c => c.Student)
                .Include(c => c.Course)
                .FirstOrDefaultAsync(c => c.CertificateNumber == certificateNumber);

            if (certificate == null)
                return null;

            return new CertificateDto
            {
                CertificateId = certificate.CertificateId,
                CertificateNumber = certificate.CertificateNumber,
                StudentId = certificate.StudentId,
                StudentName = $"{certificate.Student.FirstName} {certificate.Student.LastName}",
                CourseId = certificate.CourseId,
                CourseTitle = certificate.Course.Title,
                IssuedAt = certificate.IssuedAt,
                CertificateUrl = certificate.CertificateUrl
            };
        }
    }
}
