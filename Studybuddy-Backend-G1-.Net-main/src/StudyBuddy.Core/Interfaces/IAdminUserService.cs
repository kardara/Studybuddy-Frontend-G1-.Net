using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;

namespace StudyBuddy.Core.Interfaces
{
    public interface IAdminUserService
    {
        Task<UserListResponseDto> GetAllUsersAsync(UserListRequestDto request);
        Task<UserDetailsDto> GetUserByIdAsync(int userId);
        Task<UserDto> CreateUserAsync(CreateUserRequestDto request);
        Task<UserDto> UpdateUserAsync(int userId, UpdateUserRequestDto request);
        Task<bool> DeleteUserAsync(int userId);
        Task<BlockUserResponseDto> BlockUserAsync(int userId, BlockUserRequestDto request);
        Task<BlockUserResponseDto> UnblockUserAsync(int userId);
        Task<BulkUserActionResponseDto> BulkUserActionAsync(BulkUserActionRequestDto request);
        Task<List<string>> GetUserPermissionsAsync(int userId);
        Task<List<AuditLogDto>> GetAuditLogsAsync(int? userId = null, int pageNumber = 1, int pageSize = 20);
        Task<int> GetTotalUserCountAsync();
        Task<int> GetActiveUserCountAsync();
        Task<List<UserDto>> GetRecentlyRegisteredUsersAsync(int count = 10);
    }
}