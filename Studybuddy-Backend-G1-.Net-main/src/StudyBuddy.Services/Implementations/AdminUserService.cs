using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using System.Text.Json;

namespace StudyBuddy.Services.Implementations
{
    public class AdminUserService : IAdminUserService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<AuditLog> _auditLogRepository;
        private readonly IRepository<Enrollment> _enrollmentRepository;
        private readonly IRepository<Certificate> _certificateRepository;
        private readonly IRepository<QuizAttempt> _quizAttemptRepository;
        private readonly IRepository<RolePermission> _rolePermissionRepository;
        private readonly IEmailService _emailService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<AdminUserService> _logger;

        public AdminUserService(
            IRepository<User> userRepository,
            IRepository<AuditLog> auditLogRepository,
            IRepository<Enrollment> enrollmentRepository,
            IRepository<Certificate> certificateRepository,
            IRepository<QuizAttempt> quizAttemptRepository,
            IRepository<RolePermission> rolePermissionRepository,
            IEmailService emailService,
            IPasswordHasher passwordHasher,
            ILogger<AdminUserService> logger)
        {
            _userRepository = userRepository;
            _auditLogRepository = auditLogRepository;
            _enrollmentRepository = enrollmentRepository;
            _certificateRepository = certificateRepository;
            _quizAttemptRepository = quizAttemptRepository;
            _rolePermissionRepository = rolePermissionRepository;
            _emailService = emailService;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }

        public async Task<UserListResponseDto> GetAllUsersAsync(UserListRequestDto request)
        {
            try
            {
                var query = _userRepository.GetQueryable();

                // Apply filters
                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    query = query.Where(u => u.Email.Contains(request.SearchTerm) ||
                                           u.FirstName.Contains(request.SearchTerm) ||
                                           u.LastName.Contains(request.SearchTerm));
                }

                if (!string.IsNullOrWhiteSpace(request.Role))
                {
                    query = query.Where(u => u.Role == request.Role);
                }

                if (request.IsBlocked.HasValue)
                {
                    query = query.Where(u => u.IsBlocked == request.IsBlocked.Value);
                }

                // Get total count before pagination
                var totalCount = query.Count();

                // Apply pagination
                var users = query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                var userDtos = users.Select(MapUserToDto).ToList();

                return new UserListResponseDto
                {
                    Users = userDtos,
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                throw;
            }
        }

        public async Task<UserDetailsDto> GetUserByIdAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    throw new InvalidOperationException("User not found");

                var userDto = MapUserToDetailsDto(user);

                // Get additional statistics
                userDto.TotalEnrollments = await _enrollmentRepository.CountAsync(e => e.StudentId == userId);
                userDto.CompletedCourses = await _enrollmentRepository.CountAsync(e => e.StudentId == userId && e.Status == "Completed");
                userDto.TotalQuizAttempts = await _quizAttemptRepository.CountAsync(qa => qa.StudentId == userId);
                userDto.CertificatesEarned = await _certificateRepository.CountAsync(c => c.StudentId == userId);

                return userDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user details for user ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<UserDto> CreateUserAsync(CreateUserRequestDto request)
        {
            try
            {
                // Check if email already exists
                var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                    throw new InvalidOperationException("Email is already taken");

                // Create new user
                var user = new User
                {
                    Email = request.Email,
                    PasswordHash = _passwordHasher.HashPassword(request.Password),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    PhoneNumber = request.PhoneNumber,
                    Role = request.Role,
                    IsActive = request.IsActive,
                    IsBlocked = request.IsBlocked,
                    BlockReason = request.BlockReason,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _userRepository.AddAsync(user);
                await _userRepository.SaveChangesAsync();

                // Log the action
                await LogAuditActionAsync(user.UserId, "CreateUser", "User", user.UserId, null,
                    System.Text.Json.JsonSerializer.Serialize(request));

                return MapUserToDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user with email: {Email}", request.Email);
                throw;
            }
        }

        public async Task<UserDto> UpdateUserAsync(int userId, UpdateUserRequestDto request)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    throw new InvalidOperationException("User not found");

                var oldUserJson = JsonSerializer.Serialize(new
                {
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.PhoneNumber,
                    user.Role,
                    user.IsActive
                });

                // Update user properties
                user.FirstName = request.FirstName;
                user.LastName = request.LastName;
                user.PhoneNumber = request.PhoneNumber;
                user.Role = request.Role;
                user.IsActive = request.IsActive;
                user.UpdatedAt = DateTime.UtcNow;

                if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
                {
                    // Check if email is already taken
                    var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email && u.UserId != userId);
                    if (existingUser != null)
                        throw new InvalidOperationException("Email is already taken");

                    user.Email = request.Email;
                }

                await _userRepository.UpdateAsync(user);
                await _userRepository.SaveChangesAsync();

                // Log the action
                await LogAuditActionAsync(userId, "UpdateUser", "User", userId, oldUserJson, JsonSerializer.Serialize(request));

                return MapUserToDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    return false;

                // Check if user has enrollments
                var hasEnrollments = await _enrollmentRepository.AnyAsync(e => e.StudentId == userId);
                if (hasEnrollments)
                    throw new InvalidOperationException("Cannot delete user with existing enrollments");

                // Check if user has certificates
                var hasCertificates = await _certificateRepository.AnyAsync(c => c.StudentId == userId);
                if (hasCertificates)
                    throw new InvalidOperationException("Cannot delete user with existing certificates");

                await _userRepository.DeleteAsync(userId);
                await _userRepository.SaveChangesAsync();

                // Log the action
                await LogAuditActionAsync(userId, "DeleteUser", "User", userId, JsonSerializer.Serialize(user), null);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<BlockUserResponseDto> BlockUserAsync(int userId, BlockUserRequestDto request)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    throw new InvalidOperationException("User not found");

                if (user.IsBlocked)
                    throw new InvalidOperationException("User is already blocked");

                var oldUserJson = JsonSerializer.Serialize(new { user.IsBlocked, user.BlockReason });

                user.IsBlocked = true;
                user.BlockReason = request.BlockReason;
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);
                await _userRepository.SaveChangesAsync();

                // Log the action
                await LogAuditActionAsync(userId, "BlockUser", "User", userId, oldUserJson, JsonSerializer.Serialize(new { user.IsBlocked, user.BlockReason }));

                // Send notification email
                try
                {
                    await _emailService.SendAccountBlockNotificationAsync(user.Email, request.BlockReason);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send block notification email to user ID: {UserId}", userId);
                }

                return new BlockUserResponseDto
                {
                    UserId = user.UserId,
                    UserName = $"{user.FirstName} {user.LastName}",
                    IsBlocked = true,
                    BlockReason = request.BlockReason,
                    BlockedAt = DateTime.UtcNow,
                    Message = "User has been blocked successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking user ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<BlockUserResponseDto> UnblockUserAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    throw new InvalidOperationException("User not found");

                if (!user.IsBlocked)
                    throw new InvalidOperationException("User is not blocked");

                var oldUserJson = JsonSerializer.Serialize(new { user.IsBlocked, user.BlockReason });

                user.IsBlocked = false;
                user.BlockReason = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);
                await _userRepository.SaveChangesAsync();

                // Log the action
                await LogAuditActionAsync(userId, "UnblockUser", "User", userId, oldUserJson, JsonSerializer.Serialize(new { user.IsBlocked, user.BlockReason }));

                return new BlockUserResponseDto
                {
                    UserId = user.UserId,
                    UserName = $"{user.FirstName} {user.LastName}",
                    IsBlocked = false,
                    BlockReason = null,
                    BlockedAt = DateTime.UtcNow,
                    Message = "User has been unblocked successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unblocking user ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<BulkUserActionResponseDto> BulkUserActionAsync(BulkUserActionRequestDto request)
        {
            var result = new BulkUserActionResponseDto
            {
                Successful = 0,
                Failed = 0,
                Errors = new List<BulkActionErrorDto>()
            };

            foreach (var userId in request.UserIds)
            {
                try
                {
                    switch (request.Action.ToLower())
                    {
                        case "block":
                            await BlockUserAsync(userId, new BlockUserRequestDto { BlockReason = request.Reason ?? "Bulk block operation" });
                            result.Successful++;
                            break;
                        case "unblock":
                            await UnblockUserAsync(userId);
                            result.Successful++;
                            break;
                        case "delete":
                            await DeleteUserAsync(userId);
                            result.Successful++;
                            break;
                        case "change_role":
                            var user = await _userRepository.GetByIdAsync(userId);
                            if (user != null && !string.IsNullOrEmpty(request.NewRole))
                            {
                                user.Role = request.NewRole;
                                user.UpdatedAt = DateTime.UtcNow;
                                await _userRepository.UpdateAsync(user);
                                await _userRepository.SaveChangesAsync();
                                result.Successful++;
                            }
                            else
                            {
                                result.Errors.Add(new BulkActionErrorDto { UserId = userId, Error = "User not found or new role is empty" });
                                result.Failed++;
                            }
                            break;
                        default:
                            result.Errors.Add(new BulkActionErrorDto { UserId = userId, Error = $"Unknown action: {request.Action}" });
                            result.Failed++;
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error performing bulk action {Action} on user {UserId}", request.Action, userId);
                    result.Errors.Add(new BulkActionErrorDto { UserId = userId, Error = ex.Message });
                    result.Failed++;
                }
            }

            return result;
        }

        public async Task<List<string>> GetUserPermissionsAsync(int userId)
        {
            try
            {
                var rolePermissions = await _rolePermissionRepository.GetAsync(
                    rp => rp.Role == "Student" || rp.Role == "Admin"); // Simplified for now
                
                return rolePermissions.Select(rp => rp.PermissionId.ToString()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions for user ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<List<AuditLogDto>> GetAuditLogsAsync(int? userId = null, int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                var query = _auditLogRepository.GetQueryable();

                if (userId.HasValue)
                {
                    query = query.Where(a => a.UserId == userId.Value);
                }

                var auditLogs = query
                    .OrderByDescending(a => a.CreatedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return auditLogs.Select(MapAuditLogToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs");
                throw;
            }
        }

        public async Task<int> GetTotalUserCountAsync()
        {
            return await _userRepository.CountAsync();
        }

        public async Task<int> GetActiveUserCountAsync()
        {
            return await _userRepository.CountAsync(u => u.IsActive && !u.IsBlocked);
        }

        public async Task<List<UserDto>> GetRecentlyRegisteredUsersAsync(int count = 10)
        {
            try
            {
                var users = await _userRepository.GetAsync(
                    predicate: null,
                    orderBy: u => u.OrderByDescending(x => x.CreatedAt),
                    pageNumber: 1,
                    pageSize: count);

                return users.Select(MapUserToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recently registered users");
                throw;
            }
        }

        private UserDto MapUserToDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}",
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                IsActive = user.IsActive,
                IsBlocked = user.IsBlocked,
                BlockReason = user.BlockReason,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        private UserDetailsDto MapUserToDetailsDto(User user)
        {
            return new UserDetailsDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}",
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                IsActive = user.IsActive,
                IsBlocked = user.IsBlocked,
                BlockReason = user.BlockReason,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                UpdatedAt = user.UpdatedAt,
                Permissions = new List<string>()
            };
        }

        private AuditLogDto MapAuditLogToDto(AuditLog auditLog)
        {
            return new AuditLogDto
            {
                AuditLogId = auditLog.AuditLogId,
                UserId = auditLog.UserId,
                UserName = "", // Will be populated with user name if needed
                ActionType = auditLog.ActionType,
                EntityType = auditLog.EntityType,
                EntityId = auditLog.EntityId,
                OldValues = auditLog.OldValues,
                NewValues = auditLog.NewValues,
                CreatedAt = auditLog.CreatedAt
            };
        }

        private async Task LogAuditActionAsync(int adminUserId, string actionType, string entityType, int entityId, string? oldValues, string? newValues)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    UserId = adminUserId,
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