using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddy.Core.Interfaces;

namespace StudyBuddy.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CoursesController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublishedCourses()
        {
            var courses = await _courseService.GetPublishedCoursesAsync();
            return Ok(courses);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCourseById(int id)
        {
            var course = await _courseService.GetCourseByIdAsync(id);
            
            if (course == null)
                return NotFound(new { message = "Course not found" });

            return Ok(course);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchCourses([FromQuery] string q)
        {
            var courses = await _courseService.SearchCoursesAsync(q);
            return Ok(courses);
        }
    }
}
