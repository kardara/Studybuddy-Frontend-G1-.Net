using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddy.Core.Interfaces;
using System.Security.Claims;

namespace StudyBuddy.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class CertificatesController : ControllerBase
    {
        private readonly ICertificateService _certificateService;

        public CertificatesController(ICertificateService certificateService)
        {
            _certificateService = certificateService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        [HttpPost("issue")]
        public async Task<IActionResult> IssueCertificate([FromBody] int courseId)
        {
            try
            {
                var studentId = GetCurrentUserId();
                var certificate = await _certificateService.IssueCertificateAsync(studentId, courseId);
                return Ok(certificate);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-certificates")]
        public async Task<IActionResult> GetMyCertificates()
        {
            var studentId = GetCurrentUserId();
            var certificates = await _certificateService.GetStudentCertificatesAsync(studentId);
            return Ok(certificates);
        }

        [HttpGet("verify/{certificateNumber}")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyCertificate(string certificateNumber)
        {
            var certificate = await _certificateService.GetCertificateByNumberAsync(certificateNumber);

            if (certificate == null)
                return NotFound(new { message = "Certificate not found" });

            return Ok(certificate);
        }
    }
}
