using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Services.Implementations
{
    public class PermissionService : IPermissionService
    {
        private readonly IRepository<Permission> _permissionRepository;
        private readonly IRepository<RolePermission> _rolePermissionRepository;
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<AuditLog> _auditLogRepository;
        private readonly ILogger<PermissionService> _logger;

        public PermissionService(
            IRepository<Permission> permissionRepository,
            IRepository<RolePermission> rolePermissionRepository,
            IRepository<User> userRepository,
            IRepository<AuditLog> auditLogRepository,
            ILogger<PermissionService> logger)
        {
            _permissionRepository = permissionRepository;
            _rolePermissionRepository = rolePermissionRepository;
            _userRepository = userRepository;
            _auditLogRepository = auditLogRepository;
            _logger = logger;
        }

        public async Task<List<PermissionDto>> GetAllPermissionsAsync()
        {
            var permissions = await _permissionRepository.GetAsync();
            return permissions.Select(p => new PermissionDto
            {
                PermissionId = p.PermissionId,
                PermissionName = p.PermissionName,
                Description = p.Description
            }).ToList();
        }

        public async Task<List<PermissionDto>> GetUserPermissionsAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return new List<PermissionDto>();

            // Get permissions based on user's role
            var rolePermissions = await _rolePermissionRepository.GetAsync(
                rp => rp.Role == user.Role);

            var permissions = await _permissionRepository.GetAsync();

            return permissions.Select(p => new PermissionDto
            {
                PermissionId = p.PermissionId,
                PermissionName = p.PermissionName,
                Description = p.Description,
                IsGrantedToUser = rolePermissions.Any(rp => rp.PermissionId == p.PermissionId)
            }).ToList();
        }

        public Task<bool> GrantPermissionToUserAsync(GrantPermissionRequestDto request)
        {
            try
            {
                // For role-based permissions, we grant permissions to roles, not individual users
                // This method should be updated to grant permissions to roles instead
                _logger.LogWarning("GrantPermissionToUserAsync should be updated to work with role-based permissions");
                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error granting permission to user: {UserId}", request.UserId);
                return Task.FromResult(false);
            }
        }

        public Task<bool> RevokePermissionFromUserAsync(int userId, int permissionId)
        {
            try
            {
                // For role-based permissions, we revoke permissions from roles, not individual users
                // This method should be updated to work with role-based permissions
                _logger.LogWarning("RevokePermissionFromUserAsync should be updated to work with role-based permissions");
                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking permission from user: {UserId}", userId);
                return Task.FromResult(false);
            }
        }

        public Task<bool> RevokeAllUserPermissionsAsync(int userId)
        {
            try
            {
                // For role-based permissions, we revoke permissions from roles, not individual users
                // This method should be updated to work with role-based permissions
                _logger.LogWarning("RevokeAllUserPermissionsAsync should be updated to work with role-based permissions");
                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking all permissions for user: {UserId}", userId);
                return Task.FromResult(false);
            }
        }

        public async Task<bool> UserHasPermissionAsync(int userId, string permissionName)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            var permission = await _permissionRepository.FirstOrDefaultAsync(p => p.PermissionName == permissionName);
            if (permission == null) return false;

            var rolePermission = await _rolePermissionRepository.FirstOrDefaultAsync(
                rp => rp.Role == user.Role && rp.PermissionId == permission.PermissionId);

            return rolePermission != null;
        }

        public async Task<bool> UserHasAnyPermissionAsync(int userId, List<string> permissionNames)
        {
            foreach (var permissionName in permissionNames)
            {
                if (await UserHasPermissionAsync(userId, permissionName))
                {
                    return true;
                }
            }
            return false;
        }

        public async Task SeedDefaultPermissionsAsync()
        {
            try
            {
                var defaultPermissions = new[]
                {
                    new Permission { PermissionName = "CourseManagement", Description = "Create, edit, and manage courses" },
                    new Permission { PermissionName = "UserManagement", Description = "Manage user accounts and permissions" },
                    new Permission { PermissionName = "AnalyticsView", Description = "View analytics and reports" },
                    new Permission { PermissionName = "ContentModeration", Description = "Moderate course content" },
                    new Permission { PermissionName = "CertificateIssuance", Description = "Issue certificates manually" },
                    new Permission { PermissionName = "BulkOperations", Description = "Perform bulk operations" },
                    new Permission { PermissionName = "SystemSettings", Description = "Modify system settings" }
                };

                foreach (var permission in defaultPermissions)
                {
                    var existing = await _permissionRepository.FirstOrDefaultAsync(p => p.PermissionName == permission.PermissionName);
                    if (existing == null)
                    {
                        await _permissionRepository.AddAsync(permission);
                    }
                }

                await _permissionRepository.SaveChangesAsync();
                _logger.LogInformation("Default permissions seeded successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding default permissions");
                throw;
            }
        }

        private async Task LogAuditActionAsync(int userId, string actionType, string entityType, int entityId, string? oldValues, string? newValues)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    UserId = userId,
                    ActionType = actionType,
                    EntityType = entityType,
                    EntityId = entityId,
                    OldValues = oldValues,
                    NewValues = newValues,
                    CreatedAt = DateTime.UtcNow
                };

                await _auditLogRepository.AddAsync(auditLog);
                await _auditLogRepository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to log audit action: {ActionType}", actionType);
            }
        }
    }
}