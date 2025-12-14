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
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly ILogger<CoursesController> _logger;

        public CoursesController(
            ICourseService courseService,
            ILogger<CoursesController> logger)
        {
            _courseService = courseService;
            _logger = logger;
        }

        #region Public Endpoints

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublishedCourses()
        {
            try
            {
                var courses = await _courseService.GetPublishedCoursesAsync();
                return Ok(courses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving published courses");
                return StatusCode(500, new { message = "An error occurred while retrieving courses" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCourseById(int id)
        {
            try
            {
                var course = await _courseService.GetCourseByIdAsync(id);
                
                if (course == null)
                    return NotFound(new { message = "Course not found" });

                return Ok(course);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving course with ID: {id}");
                return StatusCode(500, new { message = "An error occurred while retrieving the course" });
            }
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchCourses([FromQuery] string q)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                    return BadRequest(new { message = "Search query cannot be empty" });

                var courses = await _courseService.SearchCoursesAsync(q);
                return Ok(courses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching courses with query: {q}");
                return StatusCode(500, new { message = "An error occurred while searching courses" });
            }
        }

        #endregion

        #region Admin Endpoints

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var course = await _courseService.CreateCourseAsync(request);
                if (course == null)
                    return BadRequest(new { message = "Failed to create course" });

                return CreatedAtAction(nameof(GetCourseById), new { id = course.CourseId }, course);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course");
                return StatusCode(500, new { message = "An error occurred while creating the course" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] UpdateCourseRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var course = await _courseService.UpdateCourseAsync(id, request);
                
                if (course == null)
                    return NotFound(new { message = "Course not found" });

                return Ok(course);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating course with ID: {id}");
                return StatusCode(500, new { message = "An error occurred while updating the course" });
            }
        }

        [HttpPost("{id}/publish")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PublishCourse(int id)
        {
            try
            {
                var result = await _courseService.PublishCourseAsync(id);
                
                if (!result)
                    return NotFound(new { message = "Course not found" });

                return Ok(new { message = "Course published successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error publishing course with ID: {id}");
                return StatusCode(500, new { message = "An error occurred while publishing the course" });
            }
        }

        [HttpPost("{id}/unpublish")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnpublishCourse(int id)
        {
            try
            {
                var result = await _courseService.UnpublishCourseAsync(id);
                
                if (!result)
                    return NotFound(new { message = "Course not found" });

                return Ok(new { message = "Course unpublished successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error unpublishing course with ID: {id}");
                return StatusCode(500, new { message = "An error occurred while unpublishing the course" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            try
            {
                var result = await _courseService.DeleteCourseAsync(id);
                
                if (!result)
                    return NotFound(new { message = "Course not found" });

                return Ok(new { message = "Course deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting course with ID: {id}");
                return StatusCode(500, new { message = "An error occurred while deleting the course" });
            }
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCourses()
        {
            try
            {
                var courses = await _courseService.GetAllCoursesAsync();
                return Ok(courses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all courses");
                return StatusCode(500, new { message = "An error occurred while retrieving courses" });
            }
        }

        [HttpGet("admin/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCourseDetailsForAdmin(int id)
        {
            try
            {
                var course = await _courseService.GetCourseDetailsForAdminAsync(id);
                
                if (course == null)
                    return NotFound(new { message = "Course not found" });

                return Ok(course);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving admin course details for ID: {id}");
                return StatusCode(500, new { message = "An error occurred while retrieving course details" });
            }
        }

        #endregion

        #region Manual Course Content Management

        [HttpPost("{courseId}/modules")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateModule(int courseId, [FromBody] CreateModuleRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var module = await _courseService.CreateModuleAsync(courseId, request);
                
                if (module == null)
                    return NotFound(new { message = "Course not found" });

                return CreatedAtAction(nameof(GetModule), new { courseId, moduleId = module.ModuleId }, module);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating module for course ID: {courseId}");
                return StatusCode(500, new { message = "An error occurred while creating the module" });
            }
        }

        [HttpGet("{courseId}/modules/{moduleId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetModule(int courseId, int moduleId)
        {
            try
            {
                var module = await _courseService.GetModuleAsync(courseId, moduleId);
                
                if (module == null)
                    return NotFound(new { message = "Module not found" });

                return Ok(module);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving module ID: {moduleId} for course ID: {courseId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the module" });
            }
        }

        [HttpPost("{courseId}/modules/{moduleId}/lessons")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateLesson(int courseId, int moduleId, [FromBody] CreateLessonRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var lesson = await _courseService.CreateLessonAsync(courseId, moduleId, request);
                
                if (lesson == null)
                    return NotFound(new { message = "Course or module not found" });

                return CreatedAtAction(nameof(GetLesson), new { courseId, moduleId, lessonId = lesson.LessonId }, lesson);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating lesson for module ID: {moduleId}, course ID: {courseId}");
                return StatusCode(500, new { message = "An error occurred while creating the lesson" });
            }
        }

        [HttpGet("{courseId}/modules/{moduleId}/lessons/{lessonId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLesson(int courseId, int moduleId, int lessonId)
        {
            try
            {
                var lesson = await _courseService.GetLessonAsync(courseId, moduleId, lessonId);
                
                if (lesson == null)
                    return NotFound(new { message = "Lesson not found" });

                return Ok(lesson);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving lesson ID: {lessonId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the lesson" });
            }
        }

        [HttpGet("{courseId}/modules")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllModulesForCourse(int courseId)
        {
            try
            {
                var modules = await _courseService.GetAllModulesForCourseAsync(courseId);
                return Ok(modules);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving modules for course ID: {courseId}");
                return StatusCode(500, new { message = "An error occurred while retrieving modules" });
            }
        }

        [HttpGet("{courseId}/modules/{moduleId}/lessons")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllLessonsForModule(int courseId, int moduleId)
        {
            try
            {
                var lessons = await _courseService.GetAllLessonsForModuleAsync(courseId, moduleId);
                return Ok(lessons);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving lessons for module ID: {moduleId}, course ID: {courseId}");
                return StatusCode(500, new { message = "An error occurred while retrieving lessons" });
            }
        }

        #endregion
    }
}
