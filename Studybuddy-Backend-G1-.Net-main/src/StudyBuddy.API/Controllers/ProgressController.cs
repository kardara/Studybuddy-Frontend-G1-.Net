using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.DTOs.Requests;
using System.Security.Claims;

namespace StudyBuddy.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class ProgressController : ControllerBase
    {
        private readonly IProgressService _progressService;

        public ProgressController(IProgressService progressService)
        {
            _progressService = progressService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProgress([FromBody] ProgressUpdateRequest request)
        {
            try
            {
                var studentId = GetCurrentUserId();
                var success = await _progressService.UpdateProgressAsync(
                    studentId, 
                    request.LessonId, 
                    request.IsCompleted);

                if (!success)
                    return NotFound(new { message = "Lesson not found" });

                return Ok(new { message = "Progress updated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetCourseProgress(int courseId)
        {
            var studentId = GetCurrentUserId();
            var progress = await _progressService.GetCourseProgressAsync(studentId, courseId);

            if (progress == null)
                return NotFound(new { message = "Course not found" });

            return Ok(progress);
        }

        [HttpGet("my-progress")]
        public async Task<IActionResult> GetMyProgress()
        {
            var studentId = GetCurrentUserId();
            var progress = await _progressService.GetStudentProgressAsync(studentId);
            return Ok(progress);
        }
    }
}
