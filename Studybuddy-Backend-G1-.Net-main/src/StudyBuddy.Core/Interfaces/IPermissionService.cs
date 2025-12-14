using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface IPermissionService
    {
        // Permission management
        Task<List<PermissionDto>> GetAllPermissionsAsync();
        Task<List<PermissionDto>> GetUserPermissionsAsync(int userId);
        Task<bool> GrantPermissionToUserAsync(GrantPermissionRequestDto request);
        Task<bool> RevokePermissionFromUserAsync(int userId, int permissionId);
        Task<bool> RevokeAllUserPermissionsAsync(int userId);
        
        // Permission checking
        Task<bool> UserHasPermissionAsync(int userId, string permissionName);
        Task<bool> UserHasAnyPermissionAsync(int userId, List<string> permissionNames);
        
        // Built-in permissions
        Task SeedDefaultPermissionsAsync();
    }

    public class PermissionDto
    {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsGrantedToUser { get; set; }
        public DateTime? GrantedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class GrantPermissionRequestDto
    {
        public int UserId { get; set; }
        public int PermissionId { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string? Reason { get; set; }
    }
}