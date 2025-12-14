using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using System.Text;

namespace StudyBuddy.Services.Implementations
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<Course> _courseRepository;
        private readonly IRepository<Enrollment> _enrollmentRepository;
        private readonly IRepository<QuizAttempt> _quizAttemptRepository;
        private readonly IRepository<Certificate> _certificateRepository;
        private readonly IRepository<UserActivity> _userActivityRepository;
        private readonly IRepository<StudentProgress> _studentProgressRepository;
        private readonly IRepository<Quiz> _quizRepository;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(
            IRepository<User> userRepository,
            IRepository<Course> courseRepository,
            IRepository<Enrollment> enrollmentRepository,
            IRepository<QuizAttempt> quizAttemptRepository,
            IRepository<Certificate> certificateRepository,
            IRepository<UserActivity> userActivityRepository,
            IRepository<StudentProgress> studentProgressRepository,
            IRepository<Quiz> quizRepository,
            ILogger<AnalyticsService> logger)
        {
            _userRepository = userRepository;
            _courseRepository = courseRepository;
            _enrollmentRepository = enrollmentRepository;
            _quizAttemptRepository = quizAttemptRepository;
            _certificateRepository = certificateRepository;
            _userActivityRepository = userActivityRepository;
            _studentProgressRepository = studentProgressRepository;
            _quizRepository = quizRepository;
            _logger = logger;
        }

        public async Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(DashboardAnalyticsRequestDto request)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.UtcNow.AddDays(-30);
                var endDate = request.EndDate ?? DateTime.UtcNow;

                // Optimize: Use single queries with aggregations instead of multiple calls
                var totalCourses = await _courseRepository.CountAsync(c => c.Status == "Published");
                var totalStudents = await _userRepository.CountAsync(u => u.Role == "Student");
                var totalEnrollments = await _enrollmentRepository.CountAsync();
                var totalCertificates = await _certificateRepository.CountAsync();
                // Get active students today with optimized query
                var today = DateTime.UtcNow.Date;
                var activeStudentsToday = await _userActivityRepository.CountAsync(
                    ua => ua.CreatedAt.Date == today);

                // Get quiz attempts in date range with single query
                var totalQuizzesSubmitted = await _quizAttemptRepository.CountAsync(
                    qa => qa.CompletedAt.HasValue && 
                          qa.CompletedAt.Value.Date >= startDate.Date && 
                          qa.CompletedAt.Value.Date <= endDate.Date);

                // Optimize average completion rate calculation
                var averageCompletionRate = await GetAverageCompletionRateAsync();

                // Optimize daily metrics - single query instead of per-day queries
                var dailyMetrics = await GetOptimizedDailyMetricsAsync(startDate, endDate);

                // Get top courses with optimized query
                var topCourses = await GetTopPerformingCoursesAsync(5);

                // Get recent students with optimized query
                var recentStudents = await GetMostActiveStudentsAsync(5);

                return new DashboardAnalyticsDto
                {
                    TotalCourses = totalCourses,
                    TotalStudents = totalStudents,
                    TotalEnrollments = totalEnrollments,
                    ActiveStudentsToday = activeStudentsToday,
                    TotalQuizzesSubmitted = totalQuizzesSubmitted,
                    AverageCompletionRate = Math.Round(averageCompletionRate, 2),
                    TotalCertificatesIssued = totalCertificates,
                    DailyMetrics = dailyMetrics,
                    TopCourses = topCourses,
                    RecentStudents = recentStudents
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard analytics");
                throw;
            }
        }

        public async Task<CourseAnalyticsDto> GetCourseAnalyticsAsync(CourseAnalyticsRequestDto request)
        {
            try
            {
                var course = await _courseRepository.GetByIdAsync(request.CourseId);
                if (course == null)
                    throw new InvalidOperationException("Course not found");

                var startDate = request.StartDate ?? DateTime.UtcNow.AddDays(-30);
                var endDate = request.EndDate ?? DateTime.UtcNow;

                // Get enrollments with optimized query
                var enrollments = await _enrollmentRepository.GetAsync(
                    e => e.CourseId == request.CourseId);

                var totalEnrollments = enrollments.Count();
                var activeStudents = enrollments.Count(e => e.Status == "Active");
                var completedStudents = enrollments.Count(e => e.Status == "Completed");

                var completionRate = totalEnrollments > 0 
                    ? Math.Round((decimal)completedStudents / totalEnrollments * 100, 2) 
                    : 0;

                var averageProgress = enrollments.Any()
                    ? Math.Round(enrollments.Average((Enrollment e) => e.ProgressPercentage), 2)
                    : 0;

                // Get quiz statistics with optimized query
                var quizzes = await _quizRepository.GetAsync(q => q.CourseId == request.CourseId);
                var totalQuizzes = quizzes.Count();

                var quizAttempts = await _quizAttemptRepository.GetAsync(
                    qa => qa.CourseId == request.CourseId);

                var totalQuizAttempts = quizAttempts.Count();
                var averageQuizScore = quizAttempts.Any()
                    ? Math.Round(quizAttempts.Average((QuizAttempt qa) => qa.PercentageScore ?? 0), 2)
                    : 0;

                // Get certificates issued
                var certificatesIssued = await _certificateRepository.CountAsync(
                    c => c.CourseId == request.CourseId);

                // Get enrollment trends
                var enrollmentTrends = await GetEnrollmentTrendsForCourseAsync(request.CourseId, startDate, endDate);

                // Get progress distribution
                var progressDistribution = GetProgressDistribution(enrollments);

                return new CourseAnalyticsDto
                {
                    CourseId = course.CourseId,
                    CourseName = course.Title,
                    TotalEnrollments = totalEnrollments,
                    ActiveStudents = activeStudents,
                    CompletedStudents = completedStudents,
                    CompletionRate = completionRate,
                    AverageProgress = averageProgress,
                    TotalQuizzes = totalQuizzes,
                    TotalQuizAttempts = totalQuizAttempts,
                    AverageQuizScore = averageQuizScore,
                    CertificatesIssued = certificatesIssued,
                    EnrollmentTrends = enrollmentTrends,
                    ProgressDistribution = progressDistribution
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course analytics for course ID: {CourseId}", request.CourseId);
                throw;
            }
        }

        public async Task<StudentAnalyticsListDto> GetStudentAnalyticsAsync(StudentAnalyticsRequestDto request)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.UtcNow.AddDays(-30);
                var endDate = request.EndDate ?? DateTime.UtcNow;

                var query = _userRepository.GetQueryable().Where(u => u.Role == "Student");

                if (request.StudentId.HasValue)
                {
                    query = query.Where(u => u.UserId == request.StudentId.Value);
                }

                var totalCount = query.Count();

                var students = query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                // FIX: Eliminate N+1 query problem by using optimized approach
                var studentAnalytics = await GetOptimizedStudentAnalyticsAsync(students);

                return new StudentAnalyticsListDto
                {
                    Students = studentAnalytics,
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student analytics");
                throw;
            }
        }

        public async Task<StudentAnalyticsDto> GetStudentProgressAnalyticsAsync(int studentId)
        {
            try
            {
                var student = await _userRepository.GetByIdAsync(studentId);
                if (student == null)
                    throw new InvalidOperationException("Student not found");

                return await GetIndividualStudentAnalyticsAsync(student);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student progress analytics for student ID: {StudentId}", studentId);
                throw;
            }
        }

        public async Task<ExportReportDto> ExportReportAsync(ExportReportRequestDto request)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.UtcNow.AddDays(-30);
                var endDate = request.EndDate ?? DateTime.UtcNow;

                var csvContent = request.ReportType.ToLower() switch
                {
                    "courses" => await GenerateCoursesReportAsync(startDate, endDate),
                    "students" => await GenerateStudentsReportAsync(startDate, endDate),
                    "analytics" => await GenerateAnalyticsReportAsync(startDate, endDate),
                    _ => throw new InvalidOperationException("Invalid report type")
                };

                var fileName = $"{request.ReportType}_report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{request.Format}";

                return new ExportReportDto
                {
                    ReportName = $"{request.ReportType} Report",
                    FileName = fileName,
                    ContentType = request.Format.ToLower() switch
                    {
                        "csv" => "text/csv",
                        "excel" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "pdf" => "application/pdf",
                        _ => "text/plain"
                    },
                    FileContent = Encoding.UTF8.GetBytes(csvContent),
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report: {ReportType}", request.ReportType);
                throw;
            }
        }

        public async Task<List<CourseSummaryDto>> GetTopPerformingCoursesAsync(int count = 10)
        {
            try
            {
                // Optimize: Use JOIN to get enrollments in single query
                var coursesWithEnrollments = await _courseRepository.GetQueryable()
                    .Where(c => c.Status == "Published")
                    .Select(c => new
                    {
                        Course = c,
                        TotalEnrollments = _enrollmentRepository.GetQueryable().Count(e => e.CourseId == c.CourseId),
                        CompletedStudents = _enrollmentRepository.GetQueryable().Count(e => e.CourseId == c.CourseId && e.Status == "Completed")
                    })
                    .OrderByDescending(x => x.TotalEnrollments)
                    .Take(count)
                    .ToListAsync();

                var courseSummaries = coursesWithEnrollments.Select(x =>
                {
                    var completionRate = x.TotalEnrollments > 0 
                        ? Math.Round((decimal)x.CompletedStudents / x.TotalEnrollments * 100, 2) 
                        : 0;

                    return new CourseSummaryDto
                    {
                        CourseId = x.Course.CourseId,
                        CourseName = x.Course.Title,
                        TotalEnrollments = x.TotalEnrollments,
                        CompletedStudents = x.CompletedStudents,
                        CompletionRate = completionRate
                    };
                }).ToList();

                return courseSummaries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top performing courses");
                throw;
            }
        }

        public async Task<List<StudentSummaryDto>> GetMostActiveStudentsAsync(int count = 10)
        {
            try
            {
                // Optimize: Use JOIN to get enrollment counts in single query
                var studentsWithEnrollments = await _userRepository.GetQueryable()
                    .Where(u => u.Role == "Student")
                    .Select(u => new
                    {
                        User = u,
                        TotalEnrollments = _enrollmentRepository.GetQueryable().Count(e => e.StudentId == u.UserId)
                    })
                    .OrderByDescending(x => x.User.CreatedAt)
                    .Take(count)
                    .ToListAsync();

                var studentSummaries = studentsWithEnrollments.Select(x =>
                    new StudentSummaryDto
                    {
                        StudentId = x.User.UserId,
                        StudentName = $"{x.User.FirstName} {x.User.LastName}",
                        Email = x.User.Email,
                        RegistrationDate = x.User.CreatedAt,
                        TotalEnrollments = x.TotalEnrollments
                    }).ToList();

                return studentSummaries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving most active students");
                throw;
            }
        }

        public async Task<Dictionary<string, int>> GetEnrollmentTrendsAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var enrollments = await _enrollmentRepository.GetAsync(
                    e => e.EnrolledAt.Date >= startDate.Date && e.EnrolledAt.Date <= endDate.Date);

                var trends = enrollments
                    .GroupBy(e => e.EnrolledAt.Date.ToString("yyyy-MM-dd"))
                    .ToDictionary(g => g.Key, g => g.Count());

                return trends;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving enrollment trends");
                throw;
            }
        }

        // Private optimized helper methods
        private async Task<decimal> GetAverageCompletionRateAsync()
        {
            try
            {
                var enrollmentProgress = await _enrollmentRepository.GetQueryable()
                    .Select(e => e.ProgressPercentage)
                    .ToListAsync();

                return enrollmentProgress.Any() ? enrollmentProgress.Average() : 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error calculating average completion rate, using 0");
                return 0;
            }
        }

        private async Task<List<DailyMetricDto>> GetOptimizedDailyMetricsAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var metrics = new List<DailyMetricDto>();
                var currentDate = startDate.Date;
                var endDateOnly = endDate.Date;
                var totalDays = (endDateOnly - currentDate).Days + 1;

                // Optimize: Batch queries instead of individual calls for each day
                var userActivities = await _userActivityRepository.GetQueryable()
                    .Where(ua => ua.CreatedAt.Date >= currentDate && ua.CreatedAt.Date <= endDateOnly)
                    .GroupBy(ua => ua.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .ToListAsync();

                var enrollments = await _enrollmentRepository.GetQueryable()
                    .Where(e => e.EnrolledAt.Date >= currentDate && e.EnrolledAt.Date <= endDateOnly)
                    .GroupBy(e => e.EnrolledAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .ToListAsync();

                var quizAttempts = await _quizAttemptRepository.GetQueryable()
                    .Where(qa => qa.CompletedAt.HasValue && 
                                qa.CompletedAt.Value.Date >= currentDate && 
                                qa.CompletedAt.Value.Date <= endDateOnly)
                    .GroupBy(qa => qa.CompletedAt.Value.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .ToListAsync();

                var certificates = await _certificateRepository.GetQueryable()
                    .Where(c => c.IssuedAt.Date >= currentDate && c.IssuedAt.Date <= endDateOnly)
                    .GroupBy(c => c.IssuedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .ToListAsync();

                var userRegistrations = await _userRepository.GetQueryable()
                    .Where(u => u.Role == "Student" && 
                               u.CreatedAt.Date >= currentDate && 
                               u.CreatedAt.Date <= endDateOnly)
                    .GroupBy(u => u.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .ToListAsync();

                // Build metrics for each day
                while (currentDate <= endDateOnly)
                {
                    var newRegistrations = userRegistrations.FirstOrDefault(u => u.Date == currentDate)?.Count ?? 0;
                    var newEnrollments = enrollments.FirstOrDefault(e => e.Date == currentDate)?.Count ?? 0;
                    var quizzesCompleted = quizAttempts.FirstOrDefault(q => q.Date == currentDate)?.Count ?? 0;
                    var certificatesIssued = certificates.FirstOrDefault(c => c.Date == currentDate)?.Count ?? 0;

                    metrics.Add(new DailyMetricDto
                    {
                        Date = currentDate,
                        NewRegistrations = newRegistrations,
                        NewEnrollments = newEnrollments,
                        QuizzesCompleted = quizzesCompleted,
                        CertificatesIssued = certificatesIssued
                    });

                    currentDate = currentDate.AddDays(1);
                }

                return metrics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimized daily metrics");
                // Return empty list as fallback
                return new List<DailyMetricDto>();
            }
        }

        private async Task<List<StudentAnalyticsDto>> GetOptimizedStudentAnalyticsAsync(List<User> students)
        {
            try
            {
                if (!students.Any())
                    return new List<StudentAnalyticsDto>();

                var studentIds = students.Select(s => s.UserId).ToList();

                // Optimize: Get all data in batch queries instead of individual calls
                var enrollments = await _enrollmentRepository.GetQueryable()
                    .Where(e => studentIds.Contains(e.StudentId))
                    .ToListAsync();

                var quizAttempts = await _quizAttemptRepository.GetQueryable()
                    .Where(qa => studentIds.Contains(qa.StudentId))
                    .ToListAsync();

                var certificates = await _certificateRepository.GetQueryable()
                    .Where(c => studentIds.Contains(c.StudentId))
                    .ToListAsync();

                var studentProgress = await _studentProgressRepository.GetQueryable()
                    .Where(sp => studentIds.Contains(sp.StudentId))
                    .ToListAsync();

                var courses = await _courseRepository.GetQueryable().ToListAsync();
                var quizzes = await _quizRepository.GetQueryable().ToListAsync();

                var studentAnalytics = new List<StudentAnalyticsDto>();

                foreach (var student in students)
                {
                    var studentEnrollments = enrollments.Where(e => e.StudentId == student.UserId).ToList();
                    var totalEnrollments = studentEnrollments.Count;
                    var completedCourses = studentEnrollments.Count(e => e.Status == "Completed");

                    var studentQuizAttempts = quizAttempts.Where(qa => qa.StudentId == student.UserId).ToList();
                    var totalQuizAttempts = studentQuizAttempts.Count;
                    var averageQuizScore = studentQuizAttempts.Any()
                        ? Math.Round(studentQuizAttempts.Average(qa => qa.PercentageScore ?? 0), 2)
                        : 0;

                    var certificatesEarned = certificates.Count(c => c.StudentId == student.UserId);

                    var studentStudyProgress = studentProgress.Where(sp => sp.StudentId == student.UserId).ToList();
                    var totalStudyTimeMinutes = studentStudyProgress.Sum(sp => sp.TimeSpentMinutes);

                    // Get course progress details
                    var courseProgress = new List<CourseProgressDto>();
                    foreach (var enrollment in studentEnrollments)
                    {
                        var course = courses.FirstOrDefault(c => c.CourseId == enrollment.CourseId);
                        if (course != null)
                        {
                            courseProgress.Add(new CourseProgressDto
                            {
                                CourseId = course.CourseId,
                                CourseName = course.Title,
                                ProgressPercentage = enrollment.ProgressPercentage,
                                Status = enrollment.Status,
                                EnrolledAt = enrollment.EnrolledAt,
                                CompletedAt = enrollment.CompletedAt
                            });
                        }
                    }

                    // Get quiz performance details
                    var quizPerformance = new List<QuizPerformanceDto>();
                    foreach (var attemptGroup in studentQuizAttempts.GroupBy(qa => qa.QuizId))
                    {
                        var quiz = quizzes.FirstOrDefault(q => q.QuizId == attemptGroup.Key);
                        if (quiz != null)
                        {
                            var attempts = attemptGroup.ToList();
                            quizPerformance.Add(new QuizPerformanceDto
                            {
                                QuizId = quiz.QuizId,
                                QuizTitle = quiz.Title,
                                TotalAttempts = attempts.Count,
                                BestScore = attempts.Max(a => a.PercentageScore ?? 0),
                                AverageScore = Math.Round(attempts.Average(a => a.PercentageScore ?? 0), 2),
                                LastAttemptAt = attempts.Max(a => a.CompletedAt ?? a.StartedAt)
                            });
                        }
                    }

                    studentAnalytics.Add(new StudentAnalyticsDto
                    {
                        StudentId = student.UserId,
                        StudentName = $"{student.FirstName} {student.LastName}",
                        Email = student.Email,
                        RegistrationDate = student.CreatedAt,
                        TotalEnrollments = totalEnrollments,
                        CompletedCourses = completedCourses,
                        TotalQuizAttempts = totalQuizAttempts,
                        AverageQuizScore = averageQuizScore,
                        CertificatesEarned = certificatesEarned,
                        TotalStudyTimeMinutes = totalStudyTimeMinutes,
                        CourseProgress = courseProgress,
                        QuizPerformance = quizPerformance
                    });
                }

                return studentAnalytics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimized student analytics");
                throw;
            }
        }

        private async Task<StudentAnalyticsDto> GetIndividualStudentAnalyticsAsync(User student)
        {
            var enrollments = await _enrollmentRepository.GetAsync(e => e.StudentId == student.UserId);
            var totalEnrollments = enrollments.Count();
            var completedCourses = enrollments.Count(e => e.Status == "Completed");

            var quizAttempts = await _quizAttemptRepository.GetAsync(qa => qa.StudentId == student.UserId);
            var totalQuizAttempts = quizAttempts.Count();
            var averageQuizScore = quizAttempts.Any()
                ? Math.Round(quizAttempts.Average((QuizAttempt qa) => qa.PercentageScore ?? 0), 2)
                : 0;

            var certificatesEarned = await _certificateRepository.CountAsync(c => c.StudentId == student.UserId);

            var studentProgress = await _studentProgressRepository.GetAsync(sp => sp.StudentId == student.UserId);
            var totalStudyTimeMinutes = studentProgress.Sum((StudentProgress sp) => sp.TimeSpentMinutes);

            // Get course progress details
            var courseProgress = new List<CourseProgressDto>();
            foreach (var enrollment in enrollments)
            {
                var course = await _courseRepository.GetByIdAsync(enrollment.CourseId);
                if (course != null)
                {
                    courseProgress.Add(new CourseProgressDto
                    {
                        CourseId = course.CourseId,
                        CourseName = course.Title,
                        ProgressPercentage = enrollment.ProgressPercentage,
                        Status = enrollment.Status,
                        EnrolledAt = enrollment.EnrolledAt,
                        CompletedAt = enrollment.CompletedAt
                    });
                }
            }

            // Get quiz performance details
            var quizPerformance = new List<QuizPerformanceDto>();
            foreach (var attempt in quizAttempts.GroupBy(qa => qa.QuizId))
            {
                var quiz = await _quizRepository.GetByIdAsync(attempt.Key);
                if (quiz != null)
                {
                    var attempts = attempt.ToList();
                    quizPerformance.Add(new QuizPerformanceDto
                    {
                        QuizId = quiz.QuizId,
                        QuizTitle = quiz.Title,
                        TotalAttempts = attempts.Count,
                        BestScore = attempts.Max((QuizAttempt a) => a.PercentageScore ?? 0),
                        AverageScore = Math.Round(attempts.Average((QuizAttempt a) => a.PercentageScore ?? 0), 2),
                        LastAttemptAt = attempts.Max((QuizAttempt a) => a.CompletedAt ?? a.StartedAt)
                    });
                }
            }

            return new StudentAnalyticsDto
            {
                StudentId = student.UserId,
                StudentName = $"{student.FirstName} {student.LastName}",
                Email = student.Email,
                RegistrationDate = student.CreatedAt,
                TotalEnrollments = totalEnrollments,
                CompletedCourses = completedCourses,
                TotalQuizAttempts = totalQuizAttempts,
                AverageQuizScore = averageQuizScore,
                CertificatesEarned = certificatesEarned,
                TotalStudyTimeMinutes = totalStudyTimeMinutes,
                CourseProgress = courseProgress,
                QuizPerformance = quizPerformance
            };
        }

        private async Task<List<EnrollmentTrendDto>> GetEnrollmentTrendsForCourseAsync(int courseId, DateTime startDate, DateTime endDate)
        {
            var enrollments = await _enrollmentRepository.GetAsync(
                e => e.CourseId == courseId && 
                     e.EnrolledAt.Date >= startDate.Date && 
                     e.EnrolledAt.Date <= endDate.Date,
                e => e.OrderBy(x => x.EnrolledAt));

            var trends = enrollments
                .GroupBy(e => e.EnrolledAt.Date)
                .OrderBy(g => g.Key)
                .Select(g => new EnrollmentTrendDto
                {
                    Date = g.Key,
                    NewEnrollments = g.Count(),
                    TotalEnrollments = g.Count() // This would need cumulative calculation in a real implementation
                })
                .ToList();

            return trends;
        }

        private List<ProgressDistributionDto> GetProgressDistribution(IEnumerable<Enrollment> enrollments)
        {
            var distribution = new List<ProgressDistributionDto>
            {
                new ProgressDistributionDto { ProgressRange = "0-25%", StudentCount = 0, Percentage = 0 },
                new ProgressDistributionDto { ProgressRange = "26-50%", StudentCount = 0, Percentage = 0 },
                new ProgressDistributionDto { ProgressRange = "51-75%", StudentCount = 0, Percentage = 0 },
                new ProgressDistributionDto { ProgressRange = "76-99%", StudentCount = 0, Percentage = 0 },
                new ProgressDistributionDto { ProgressRange = "100%", StudentCount = 0, Percentage = 0 }
            };

            var totalStudents = enrollments.Count();
            if (totalStudents == 0) return distribution;

            foreach (var enrollment in enrollments)
            {
                var progress = enrollment.ProgressPercentage;
                if (progress <= 25) distribution[0].StudentCount++;
                else if (progress <= 50) distribution[1].StudentCount++;
                else if (progress <= 75) distribution[2].StudentCount++;
                else if (progress < 100) distribution[3].StudentCount++;
                else distribution[4].StudentCount++;
            }

            foreach (var range in distribution)
            {
                range.Percentage = Math.Round((decimal)range.StudentCount / totalStudents * 100, 2);
            }

            return distribution;
        }

        private async Task<string> GenerateCoursesReportAsync(DateTime startDate, DateTime endDate)
        {
            var courses = await _courseRepository.GetAsync(
                c => c.CreatedAt.Date >= startDate.Date && c.CreatedAt.Date <= endDate.Date);

            var sb = new StringBuilder();
            sb.AppendLine("CourseId,Title,Category,Status,TotalEnrollments,CreatedAt");

            foreach (var course in courses)
            {
                var enrollments = await _enrollmentRepository.CountAsync(e => e.CourseId == course.CourseId);
                sb.AppendLine($"{course.CourseId},\"{course.Title}\",\"{course.Category}\",{course.Status},{enrollments},{course.CreatedAt:yyyy-MM-dd}");
            }

            return sb.ToString();
        }

        private async Task<string> GenerateStudentsReportAsync(DateTime startDate, DateTime endDate)
        {
            var students = await _userRepository.GetAsync(
                u => u.Role == "Student" && 
                     u.CreatedAt.Date >= startDate.Date && 
                     u.CreatedAt.Date <= endDate.Date);

            var sb = new StringBuilder();
            sb.AppendLine("StudentId,Name,Email,RegistrationDate,TotalEnrollments,CompletedCourses");

            foreach (var student in students)
            {
                var enrollments = await _enrollmentRepository.GetAsync(e => e.StudentId == student.UserId);
                var completedCourses = enrollments.Count(e => e.Status == "Completed");
                
                sb.AppendLine($"{student.UserId},\"{student.FirstName} {student.LastName}\",{student.Email},{student.CreatedAt:yyyy-MM-dd},{enrollments.Count()},{completedCourses}");
            }

            return sb.ToString();
        }

        private async Task<string> GenerateAnalyticsReportAsync(DateTime startDate, DateTime endDate)
        {
            var dashboard = await GetDashboardAnalyticsAsync(new DashboardAnalyticsRequestDto 
            { 
                StartDate = startDate, 
                EndDate = endDate 
            });

            var sb = new StringBuilder();
            sb.AppendLine("Metric,Value");
            sb.AppendLine($"Total Courses,{dashboard.TotalCourses}");
            sb.AppendLine($"Total Students,{dashboard.TotalStudents}");
            sb.AppendLine($"Total Enrollments,{dashboard.TotalEnrollments}");
            sb.AppendLine($"Active Students Today,{dashboard.ActiveStudentsToday}");
            sb.AppendLine($"Total Quizzes Submitted,{dashboard.TotalQuizzesSubmitted}");
            sb.AppendLine($"Average Completion Rate,{dashboard.AverageCompletionRate}%");
            sb.AppendLine($"Total Certificates Issued,{dashboard.TotalCertificatesIssued}");
            return sb.ToString();
        }
    }
}