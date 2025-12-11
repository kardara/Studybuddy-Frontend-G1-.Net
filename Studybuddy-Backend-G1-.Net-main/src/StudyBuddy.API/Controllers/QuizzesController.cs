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
    public class QuizzesController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizzesController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuiz(int id)
        {
            var quiz = await _quizService.GetQuizByIdAsync(id);

            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });

            return Ok(quiz);
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitQuiz(int id, [FromBody] QuizSubmissionRequest submission)
        {
            try
            {
                submission.QuizId = id; // Ensure quiz ID matches route
                var studentId = GetCurrentUserId();
                var result = await _quizService.SubmitQuizAsync(studentId, submission);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/attempts")]
        public async Task<IActionResult> GetAttempts(int id)
        {
            var studentId = GetCurrentUserId();
            var attempts = await _quizService.GetQuizAttemptsAsync(studentId, id);
            return Ok(attempts);
        }

        [HttpGet("attempts/{attemptId}")]
        public async Task<IActionResult> GetAttemptResult(int attemptId)
        {
            var result = await _quizService.GetQuizResultAsync(attemptId);

            if (result == null)
                return NotFound(new { message = "Attempt not found" });

            return Ok(result);
        }
    }
}
