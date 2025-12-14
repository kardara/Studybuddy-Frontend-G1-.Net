using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize] // All endpoints require authentication
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly ILogger<PermissionsController> _logger;

        public PermissionsController(IPermissionService permissionService, ILogger<PermissionsController> logger)
        {
            _permissionService = permissionService;
            _logger = logger;
        }

        /// <summary>
        /// Get all available permissions
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<PermissionDto>>> GetAllPermissions()
        {
            try
            {
                var permissions = await _permissionService.GetAllPermissionsAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions");
                return StatusCode(500, "An error occurred while retrieving permissions");
            }
        }

        /// <summary>
        /// Get permissions for a specific user
        /// </summary>
        /// <param name="userId">User ID</param>
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<PermissionDto>>> GetUserPermissions(int userId)
        {
            try
            {
                var permissions = await _permissionService.GetUserPermissionsAsync(userId);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions for user: {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving user permissions");
            }
        }

        /// <summary>
        /// Grant permission to a user
        /// </summary>
        /// <param name="request">Grant permission request</param>
        [HttpPost("grant")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> GrantPermission([FromBody] GrantPermissionRequestDto request)
        {
            try
            {
                var result = await _permissionService.GrantPermissionToUserAsync(request);
                if (result)
                {
                    return Ok(new { message = "Permission granted successfully" });
                }
                return BadRequest("Failed to grant permission");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error granting permission");
                return StatusCode(500, "An error occurred while granting permission");
            }
        }

        /// <summary>
        /// Revoke permission from a user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="permissionId">Permission ID</param>
        [HttpDelete("user/{userId}/permission/{permissionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> RevokePermission(int userId, int permissionId)
        {
            try
            {
                var result = await _permissionService.RevokePermissionFromUserAsync(userId, permissionId);
                if (result)
                {
                    return Ok(new { message = "Permission revoked successfully" });
                }
                return BadRequest("Failed to revoke permission");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking permission");
                return StatusCode(500, "An error occurred while revoking permission");
            }
        }

        /// <summary>
        /// Revoke all permissions from a user
        /// </summary>
        /// <param name="userId">User ID</param>
        [HttpDelete("user/{userId}/all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> RevokeAllUserPermissions(int userId)
        {
            try
            {
                var result = await _permissionService.RevokeAllUserPermissionsAsync(userId);
                if (result)
                {
                    return Ok(new { message = "All permissions revoked successfully" });
                }
                return BadRequest("Failed to revoke permissions");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking all permissions for user: {UserId}", userId);
                return StatusCode(500, "An error occurred while revoking permissions");
            }
        }

        /// <summary>
        /// Check if user has specific permission
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="permissionName">Permission name</param>
        [HttpGet("user/{userId}/check/{permissionName}")]
        [Authorize]
        public async Task<ActionResult<bool>> CheckUserPermission(int userId, string permissionName)
        {
            try
            {
                var hasPermission = await _permissionService.UserHasPermissionAsync(userId, permissionName);
                return Ok(hasPermission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permission for user: {UserId}", userId);
                return StatusCode(500, "An error occurred while checking permission");
            }
        }

        /// <summary>
        /// Check if user has any of the specified permissions
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="permissions">Comma-separated permission names</param>
        [HttpGet("user/{userId}/check-any/{permissions}")]
        [Authorize]
        public async Task<ActionResult<bool>> CheckUserAnyPermission(int userId, string permissions)
        {
            try
            {
                var permissionNames = permissions.Split(',').Select(p => p.Trim()).ToList();
                var hasPermission = await _permissionService.UserHasAnyPermissionAsync(userId, permissionNames);
                return Ok(hasPermission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permissions for user: {UserId}", userId);
                return StatusCode(500, "An error occurred while checking permissions");
            }
        }

        /// <summary>
        /// Seed default permissions (Admin only)
        /// </summary>
        [HttpPost("seed")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> SeedDefaultPermissions()
        {
            try
            {
                await _permissionService.SeedDefaultPermissionsAsync();
                return Ok(new { message = "Default permissions seeded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding default permissions");
                return StatusCode(500, "An error occurred while seeding permissions");
            }
        }
    }
}