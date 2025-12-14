using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using System.Security.Claims;

namespace StudyBuddy.API.Controllers
{
    [ApiController]
    [Route("api/v1/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly IAdminUserService _adminUserService;
        private readonly ILogger<AdminUsersController> _logger;

        public AdminUsersController(IAdminUserService adminUserService, ILogger<AdminUsersController> logger)
        {
            _adminUserService = adminUserService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserListRequestDto request)
        {
            try
            {
                var result = await _adminUserService.GetAllUsersAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { message = "An error occurred while retrieving users" });
            }
        }

        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUserById(int userId)
        {
            try
            {
                var user = await _adminUserService.GetUserByIdAsync(userId);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while retrieving the user" });
            }
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _adminUserService.CreateUserAsync(request);
                return CreatedAtAction(nameof(GetUserById), new { userId = user.UserId }, user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { message = "An error occurred while creating the user" });
            }
        }

        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] UpdateUserRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _adminUserService.UpdateUserAsync(userId, request);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while updating the user" });
            }
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            try
            {
                var result = await _adminUserService.DeleteUserAsync(userId);
                
                if (!result)
                    return NotFound(new { message = "User not found" });

                return Ok(new { message = "User deleted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while deleting the user" });
            }
        }

        [HttpPut("users/{userId}/block")]
        public async Task<IActionResult> BlockUser(int userId, [FromBody] BlockUserRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _adminUserService.BlockUserAsync(userId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking user with ID: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while blocking the user" });
            }
        }

        [HttpPut("users/{userId}/unblock")]
        public async Task<IActionResult> UnblockUser(int userId)
        {
            try
            {
                var result = await _adminUserService.UnblockUserAsync(userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unblocking user with ID: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while unblocking the user" });
            }
        }

        [HttpPost("users/bulk-action")]
        public async Task<IActionResult> BulkUserAction([FromBody] BulkUserActionRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _adminUserService.BulkUserActionAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing bulk user action");
                return StatusCode(500, new { message = "An error occurred while performing bulk action" });
            }
        }

        [HttpGet("users/{userId}/permissions")]
        public async Task<IActionResult> GetUserPermissions(int userId)
        {
            try
            {
                var permissions = await _adminUserService.GetUserPermissionsAsync(userId);
                return Ok(new { userId, permissions });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions for user ID: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while retrieving user permissions" });
            }
        }

        [HttpPost("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromBody] AuditLogRequestDto request)
        {
            try
            {
                var auditLogs = await _adminUserService.GetAuditLogsAsync(request.UserId, request.PageNumber, request.PageSize);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs");
                return StatusCode(500, new { message = "An error occurred while retrieving audit logs" });
            }
        }
    }

    public class AuditLogRequestDto
    {
        public int? UserId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}