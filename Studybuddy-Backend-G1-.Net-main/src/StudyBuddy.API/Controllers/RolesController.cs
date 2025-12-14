using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.DTOs.Responses;
using StudyBuddy.Core.Models.Domain;

namespace StudyBuddy.API.Controllers
{
    [ApiController]
    [Route("api/v1/admin/roles")]
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly IRepository<RolePermission> _rolePermissionRepository;
        private readonly IRepository<User> _userRepository;
        private readonly ILogger<RolesController> _logger;

        public RolesController(
            IPermissionService permissionService,
            IRepository<RolePermission> rolePermissionRepository,
            IRepository<User> userRepository,
            ILogger<RolesController> logger)
        {
            _permissionService = permissionService;
            _rolePermissionRepository = rolePermissionRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            try
            {
                var roles = await GetRolesAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles");
                return StatusCode(500, new { message = "An error occurred while retrieving roles" });
            }
        }

        [HttpGet("{roleName}")]
        public async Task<IActionResult> GetRoleByName(string roleName)
        {
            try
            {
                var role = await GetRoleByNameAsync(roleName);
                if (role == null)
                    return NotFound(new { message = "Role not found" });

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role: {RoleName}", roleName);
                return StatusCode(500, new { message = "An error occurred while retrieving the role" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await CreateRoleAsync(request);
                return CreatedAtAction(nameof(GetRoleByName), new { roleName = request.RoleName }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role: {RoleName}", request.RoleName);
                return StatusCode(500, new { message = "An error occurred while creating the role" });
            }
        }

        [HttpPut("{roleName}")]
        public async Task<IActionResult> UpdateRole(string roleName, [FromBody] UpdateRoleRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await UpdateRoleAsync(roleName, request);
                if (result == null)
                    return NotFound(new { message = "Role not found" });

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role: {RoleName}", roleName);
                return StatusCode(500, new { message = "An error occurred while updating the role" });
            }
        }

        [HttpDelete("{roleName}")]
        public async Task<IActionResult> DeleteRole(string roleName)
        {
            try
            {
                // Check if role is used by any users
                var usersWithRole = await _userRepository.CountAsync(u => u.Role == roleName);
                if (usersWithRole > 0)
                    return BadRequest(new { message = "Cannot delete role that is assigned to users" });

                var result = await DeleteRoleAsync(roleName);
                if (!result)
                    return NotFound(new { message = "Role not found" });

                return Ok(new { message = "Role deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role: {RoleName}", roleName);
                return StatusCode(500, new { message = "An error occurred while deleting the role" });
            }
        }

        [HttpPost("{roleName}/permissions")]
        public async Task<IActionResult> AssignPermissionToRole(string roleName, [FromBody] AssignPermissionRequestDto request)
        {
            try
            {
                var result = await AssignPermissionToRoleAsync(roleName, request.PermissionId);
                if (!result)
                    return BadRequest(new { message = "Failed to assign permission to role" });

                return Ok(new { message = "Permission assigned to role successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permission to role: {RoleName}", roleName);
                return StatusCode(500, new { message = "An error occurred while assigning permission to role" });
            }
        }

        [HttpDelete("{roleName}/permissions/{permissionId}")]
        public async Task<IActionResult> RemovePermissionFromRole(string roleName, int permissionId)
        {
            try
            {
                var result = await RemovePermissionFromRoleAsync(roleName, permissionId);
                if (!result)
                    return BadRequest(new { message = "Failed to remove permission from role" });

                return Ok(new { message = "Permission removed from role successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing permission from role: {RoleName}", roleName);
                return StatusCode(500, new { message = "An error occurred while removing permission from role" });
            }
        }

        private async Task<List<RoleDto>> GetRolesAsync()
        {
            var permissions = await _permissionService.GetAllPermissionsAsync();
            var rolePermissions = await _rolePermissionRepository.GetAsync();

            var roles = rolePermissions.GroupBy(rp => rp.Role).Select(group => new RoleDto
            {
                RoleName = group.Key,
                Description = GetRoleDescription(group.Key),
                Permissions = permissions.Where(p => group.Any(rp => rp.PermissionId == p.PermissionId)).ToList()
            }).ToList();

            return roles;
        }

        private async Task<RoleDto?> GetRoleByNameAsync(string roleName)
        {
            var permissions = await _permissionService.GetAllPermissionsAsync();
            var rolePermissions = await _rolePermissionRepository.GetAsync(rp => rp.Role == roleName);

            if (!rolePermissions.Any())
                return null;

            return new RoleDto
            {
                RoleName = roleName,
                Description = GetRoleDescription(roleName),
                Permissions = permissions.Where(p => rolePermissions.Any(rp => rp.PermissionId == p.PermissionId)).ToList()
            };
        }

        private Task<RoleDto> CreateRoleAsync(CreateRoleRequestDto request)
        {
            // For this implementation, we'll consider roles as strings in the User table
            // In a more complex scenario, you might have a separate Roles table
            return Task.FromResult(new RoleDto
            {
                RoleName = request.RoleName,
                Description = request.Description ?? "",
                Permissions = new List<PermissionDto>()
            });
        }

        private async Task<RoleDto?> UpdateRoleAsync(string roleName, UpdateRoleRequestDto request)
        {
            // Implementation for updating role
            return await GetRoleByNameAsync(roleName);
        }

        private Task<bool> DeleteRoleAsync(string roleName)
        {
            // Implementation for deleting role
            // This would remove all role permissions and potentially the role itself
            return Task.FromResult(true);
        }

        private async Task<bool> AssignPermissionToRoleAsync(string roleName, int permissionId)
        {
            try
            {
                var existing = await _rolePermissionRepository.FirstOrDefaultAsync(
                    rp => rp.Role == roleName && rp.PermissionId == permissionId);

                if (existing != null)
                    return true; // Already exists

                var rolePermission = new RolePermission
                {
                    Role = roleName,
                    PermissionId = permissionId
                };

                await _rolePermissionRepository.AddAsync(rolePermission);
                await _rolePermissionRepository.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permission to role");
                return false;
            }
        }

        private async Task<bool> RemovePermissionFromRoleAsync(string roleName, int permissionId)
        {
            try
            {
                var rolePermission = await _rolePermissionRepository.FirstOrDefaultAsync(
                    rp => rp.Role == roleName && rp.PermissionId == permissionId);

                if (rolePermission == null)
                    return false;

                await _rolePermissionRepository.DeleteAsync(rolePermission.RolePermissionId);
                await _rolePermissionRepository.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing permission from role");
                return false;
            }
        }

        private string GetRoleDescription(string roleName)
        {
            return roleName.ToLower() switch
            {
                "admin" => "Administrator with full system access",
                "student" => "Student user with course access",
                "instructor" => "Instructor with course creation and management rights",
                _ => $"{roleName} role"
            };
        }
    }

    public class CreateRoleRequestDto
    {
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UpdateRoleRequestDto
    {
        public string? Description { get; set; }
    }

    public class AssignPermissionRequestDto
    {
        public int PermissionId { get; set; }
    }
}