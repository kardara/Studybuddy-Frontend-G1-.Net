using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.API.Models
{
    public class GenerateCourseFromPdfRequestDto
    {
        [Required]
        [StringLength(300)]
        public string CourseName { get; set; } = string.Empty;

        [Required]
        public IFormFile PdfFile { get; set; } = null!;
    }
}