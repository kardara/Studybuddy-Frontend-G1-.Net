using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.DTOs.Requests;

namespace StudyBuddy.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardAnalytics([FromQuery] DashboardAnalyticsRequestDto request)
        {
            try
            {
                var analytics = await _analyticsService.GetDashboardAnalyticsAsync(request);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard analytics");
                return StatusCode(500, new { message = "An error occurred while retrieving dashboard analytics" });
            }
        }

        [HttpGet("courses/{courseId}")]
        public async Task<IActionResult> GetCourseAnalytics(int courseId, [FromQuery] CourseAnalyticsRequestDto request)
        {
            try
            {
                request.CourseId = courseId;
                var analytics = await _analyticsService.GetCourseAnalyticsAsync(request);
                return Ok(analytics);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course analytics for course ID: {CourseId}", courseId);
                return StatusCode(500, new { message = "An error occurred while retrieving course analytics" });
            }
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetStudentAnalytics([FromQuery] StudentAnalyticsRequestDto request)
        {
            try
            {
                var analytics = await _analyticsService.GetStudentAnalyticsAsync(request);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student analytics");
                return StatusCode(500, new { message = "An error occurred while retrieving student analytics" });
            }
        }

        [HttpGet("students/{studentId}/progress")]
        public async Task<IActionResult> GetStudentProgressAnalytics(int studentId)
        {
            try
            {
                var analytics = await _analyticsService.GetStudentProgressAnalyticsAsync(studentId);
                return Ok(analytics);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student progress analytics for student ID: {StudentId}", studentId);
                return StatusCode(500, new { message = "An error occurred while retrieving student progress analytics" });
            }
        }

        [HttpGet("top-courses")]
        public async Task<IActionResult> GetTopPerformingCourses([FromQuery] int count = 10)
        {
            try
            {
                var courses = await _analyticsService.GetTopPerformingCoursesAsync(count);
                return Ok(courses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top performing courses");
                return StatusCode(500, new { message = "An error occurred while retrieving top performing courses" });
            }
        }

        [HttpGet("most-active-students")]
        public async Task<IActionResult> GetMostActiveStudents([FromQuery] int count = 10)
        {
            try
            {
                var students = await _analyticsService.GetMostActiveStudentsAsync(count);
                return Ok(students);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving most active students");
                return StatusCode(500, new { message = "An error occurred while retrieving most active students" });
            }
        }

        [HttpGet("enrollment-trends")]
        public async Task<IActionResult> GetEnrollmentTrends([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate > endDate)
                    return BadRequest(new { message = "Start date must be before end date" });

                var trends = await _analyticsService.GetEnrollmentTrendsAsync(startDate, endDate);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving enrollment trends");
                return StatusCode(500, new { message = "An error occurred while retrieving enrollment trends" });
            }
        }

        [HttpPost("export")]
        public async Task<IActionResult> ExportReport([FromBody] ExportReportRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var report = await _analyticsService.ExportReportAsync(request);

                return File(
                    report.FileContent,
                    report.ContentType,
                    report.FileName
                );
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report: {ReportType}", request.ReportType);
                return StatusCode(500, new { message = "An error occurred while exporting the report" });
            }
        }
    }
}