using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using System;
using System.Threading.Tasks;

namespace StudyBuddy.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                var authResponse = await _authService.RegisterAsync(request);
                return Ok(authResponse);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var authResponse = await _authService.LoginAsync(request);
                return Ok(authResponse);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            try
            {
                var result = await _authService.SendPasswordResetEmailAsync(request.Email);
                // Always return success to prevent email enumeration
                return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending password reset email");
                return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            try
            {
                var result = await _authService.ResetPasswordAsync(request);
                return Ok(new { message = "Password has been reset successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password");
                return StatusCode(500, new { message = "An error occurred while resetting password" });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                var authResponse = await _authService.RefreshTokenAsync(request.RefreshToken);
                return Ok(authResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return Unauthorized(new { message = "Invalid refresh token" });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequestDto request)
        {
            try
            {
                await _authService.LogoutAsync(request.Token);
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { message = "An error occurred during logout" });
            }
        }

        [HttpPost("verify-reset-token")]
        public async Task<IActionResult> VerifyResetToken([FromBody] VerifyResetTokenRequestDto request)
        {
            try
            {
                var isValid = await _authService.VerifyResetTokenAsync(request.ResetToken);
                return Ok(new { isValid, message = isValid ? "Reset token is valid" : "Reset token is invalid or expired" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying reset token");
                return StatusCode(500, new { message = "An error occurred while verifying reset token" });
            }
        }
    }
}
