using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using System;
using System.Threading.Tasks;

namespace StudyBuddy.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class QuizzesController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly IQuizService _quizService;
        private readonly ILogger<QuizzesController> _logger;

        public QuizzesController(
            ICourseService courseService,
            IQuizService quizService,
            ILogger<QuizzesController> logger)
        {
            _courseService = courseService;
            _quizService = quizService;
            _logger = logger;
        }

        #region Public Endpoints

        [HttpGet("course/{courseId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetQuizzesByCourse(int courseId)
        {
            try
            {
                var quizzes = await _quizService.GetQuizzesByCourseAsync(courseId);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving quizzes for course ID: {courseId}");
                return StatusCode(500, new { message = "An error occurred while retrieving quizzes" });
            }
        }

        [HttpGet("{quizId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetQuizById(int quizId)
        {
            try
            {
                var quiz = await _quizService.GetQuizByIdAsync(quizId);
                
                if (quiz == null)
                    return NotFound(new { message = "Quiz not found" });

                return Ok(quiz);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving quiz with ID: {quizId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the quiz" });
            }
        }

        [HttpGet("module/{moduleId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetQuizzesByModule(int moduleId)
        {
            try
            {
                var quizzes = await _quizService.GetQuizzesByModuleAsync(moduleId);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving quizzes for module ID: {moduleId}");
                return StatusCode(500, new { message = "An error occurred while retrieving quizzes" });
            }
        }

        #endregion

        #region Admin Endpoints

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var quiz = await _courseService.CreateQuizAsync(request);
                
                if (quiz == null)
                    return NotFound(new { message = "Course or module not found" });

                return CreatedAtAction(nameof(GetQuizById), new { quizId = quiz.QuizId }, quiz);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quiz");
                return StatusCode(500, new { message = "An error occurred while creating the quiz" });
            }
        }

        [HttpPut("{quizId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateQuiz(int quizId, [FromBody] UpdateQuizRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var quiz = await _quizService.UpdateQuizAsync(quizId, request);
                
                if (quiz == null)
                    return NotFound(new { message = "Quiz not found" });

                return Ok(quiz);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating quiz with ID: {quizId}");
                return StatusCode(500, new { message = "An error occurred while updating the quiz" });
            }
        }

        [HttpDelete("{quizId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteQuiz(int quizId)
        {
            try
            {
                var result = await _quizService.DeleteQuizAsync(quizId);
                
                if (!result)
                    return NotFound(new { message = "Quiz not found" });

                return Ok(new { message = "Quiz deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting quiz with ID: {quizId}");
                return StatusCode(500, new { message = "An error occurred while deleting the quiz" });
            }
        }

        [HttpPost("{quizId}/publish")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PublishQuiz(int quizId)
        {
            try
            {
                var result = await _quizService.PublishQuizAsync(quizId);
                
                if (!result)
                    return NotFound(new { message = "Quiz not found" });

                return Ok(new { message = "Quiz published successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error publishing quiz with ID: {quizId}");
                return StatusCode(500, new { message = "An error occurred while publishing the quiz" });
            }
        }

        [HttpPost("{quizId}/unpublish")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnpublishQuiz(int quizId)
        {
            try
            {
                var result = await _quizService.UnpublishQuizAsync(quizId);
                
                if (!result)
                    return NotFound(new { message = "Quiz not found" });

                return Ok(new { message = "Quiz unpublished successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error unpublishing quiz with ID: {quizId}");
                return StatusCode(500, new { message = "An error occurred while unpublishing the quiz" });
            }
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllQuizzes()
        {
            try
            {
                var quizzes = await _quizService.GetAllQuizzesAsync();
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all quizzes");
                return StatusCode(500, new { message = "An error occurred while retrieving quizzes" });
            }
        }

        [HttpGet("admin/course/{courseId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllQuizzesForCourse(int courseId)
        {
            try
            {
                var quizzes = await _quizService.GetAllQuizzesForCourseAsync(courseId);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving all quizzes for course ID: {courseId}");
                return StatusCode(500, new { message = "An error occurred while retrieving quizzes" });
            }
        }

        #endregion

        #region Student Quiz Taking

        [HttpPost("{quizId}/start")]
        [Authorize]
        public async Task<IActionResult> StartQuizAttempt(int quizId)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var studentId = int.Parse(userIdClaim!);

                var attempt = await _quizService.StartQuizAttemptAsync(quizId, studentId);
                
                if (attempt == null)
                    return NotFound(new { message = "Quiz not found" });

                return Ok(attempt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error starting quiz attempt for quiz ID: {quizId}");
                return StatusCode(500, new { message = "An error occurred while starting the quiz" });
            }
        }

        [HttpPost("attempts/{attemptId}/submit")]
        [Authorize]
        public async Task<IActionResult> SubmitQuizAttempt(int attemptId, [FromBody] SubmitQuizAttemptRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var studentId = int.Parse(userIdClaim!);

                var result = await _quizService.SubmitQuizAttemptAsync(attemptId, studentId, request.Answers);
                
                if (result == null)
                    return NotFound(new { message = "Quiz attempt not found" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error submitting quiz attempt ID: {attemptId}");
                return StatusCode(500, new { message = "An error occurred while submitting the quiz" });
            }
        }

        [HttpGet("attempts/{attemptId}")]
        [Authorize]
        public async Task<IActionResult> GetQuizAttempt(int attemptId)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var studentId = int.Parse(userIdClaim!);

                var attempt = await _quizService.GetQuizAttemptAsync(attemptId, studentId);
                
                if (attempt == null)
                    return NotFound(new { message = "Quiz attempt not found" });

                return Ok(attempt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving quiz attempt ID: {attemptId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the quiz attempt" });
            }
        }

        [HttpGet("student/{studentId}")]
        [Authorize]
        public async Task<IActionResult> GetStudentQuizAttempts(int studentId)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var currentStudentId = int.Parse(userIdClaim!);

                // Students can only view their own attempts unless they're admin
                if (studentId != currentStudentId && !User.IsInRole("Admin"))
                    return Forbid();

                var attempts = await _quizService.GetStudentQuizAttemptsAsync(studentId);
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving quiz attempts for student ID: {studentId}");
                return StatusCode(500, new { message = "An error occurred while retrieving quiz attempts" });
            }
        }

        #endregion
    }
}
