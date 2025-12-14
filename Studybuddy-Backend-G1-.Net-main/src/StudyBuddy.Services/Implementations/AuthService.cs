using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using StudyBuddy.Core.Configuration;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace StudyBuddy.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRepository<PasswordResetToken> _tokenRepository;
        private readonly IEmailService _emailService;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IRepository<PasswordResetToken> tokenRepository,
            IEmailService emailService,
            JwtSettings jwtSettings,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _tokenRepository = tokenRepository;
            _emailService = emailService;
            _jwtSettings = jwtSettings;
            _logger = logger;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // Check if user exists
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
                throw new InvalidOperationException("Email already registered");

            var user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                Role = string.IsNullOrEmpty(request.Role) ? "Student" : request.Role,
                IsActive = true,
                IsBlocked = false,
                CreatedAt = DateTime.UtcNow
            };

            // Hash password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            // Send welcome email
            await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);

            // Generate JWT token
            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            return new AuthResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = user.Role,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresIn = _jwtSettings.ExpirationMinutes * 60
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            if (user.IsBlocked)
                throw new UnauthorizedAccessException("Account is blocked");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Account is not active");

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            return new AuthResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = user.Role,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresIn = _jwtSettings.ExpirationMinutes * 60
            };
        }

        public async Task<bool> SendPasswordResetEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return false; // Don't reveal if email exists

            // Generate reset token
            var resetToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            var expiresAt = DateTime.UtcNow.AddHours(24);

            var token = new PasswordResetToken
            {
                UserId = user.UserId,
                ResetToken = resetToken,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow
            };

            await _tokenRepository.AddAsync(token);
            await _tokenRepository.SaveChangesAsync();

            // Create reset link
            var resetLink = $"https://yourapp.com/reset-password?token={resetToken}";

            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);
            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            var token = await _tokenRepository.FirstOrDefaultAsync(t =>
                t.ResetToken == request.Token &&
                t.ExpiresAt > DateTime.UtcNow &&
                t.IsUsed == false);

            if (token == null)
                throw new InvalidOperationException("Invalid or expired reset token");

            var user = await _userRepository.GetByIdAsync(token.UserId);
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordHash = hashedPassword;
            user.UpdatedAt = DateTime.UtcNow;

            token.IsUsed = true;
            token.UsedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
            await _tokenRepository.UpdateAsync(token);
            await _userRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> VerifyResetTokenAsync(string resetToken)
        {
            try
            {
                var token = await _tokenRepository.FirstOrDefaultAsync(t =>
                    t.ResetToken == resetToken &&
                    t.ExpiresAt > DateTime.UtcNow &&
                    t.IsUsed == false);

                return token != null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying reset token");
                return false;
            }
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                // For this implementation, we'll use a simplified approach
                // In production, you would validate the refresh token against a stored value
                
                if (string.IsNullOrWhiteSpace(refreshToken) || refreshToken.Length < 10)
                {
                    throw new UnauthorizedAccessException("Invalid refresh token");
                }

                // For demonstration purposes, we'll decode the refresh token
                // In a real implementation, you would store and validate refresh tokens properly
                var tokenHandler = new JwtSecurityTokenHandler();
                
                try
                {
                    var jwtToken = tokenHandler.ReadJwtToken(refreshToken);
                    var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                    
                    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    {
                        throw new UnauthorizedAccessException("Invalid refresh token");
                    }
                    
                    var user = await _userRepository.GetByIdAsync(userId);
                    if (user == null || user.IsBlocked || !user.IsActive)
                    {
                        throw new UnauthorizedAccessException("User not found or inactive");
                    }

                    // Generate new tokens
                    var newToken = GenerateJwtToken(user);
                    var newRefreshToken = GenerateRefreshToken();

                    _logger.LogInformation($"Token refreshed for user {user.Email}");

                    return new AuthResponseDto
                    {
                        UserId = user.UserId,
                        Email = user.Email,
                        FullName = $"{user.FirstName} {user.LastName}",
                        Role = user.Role,
                        Token = newToken,
                        RefreshToken = newRefreshToken,
                        ExpiresIn = _jwtSettings.ExpirationMinutes * 60
                    };
                }
                catch
                {
                    // If it's not a JWT token, treat it as invalid
                    throw new UnauthorizedAccessException("Invalid refresh token");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                throw new UnauthorizedAccessException("Invalid refresh token");
            }
        }

        public async Task LogoutAsync(string token)
        {
            try
            {
                // In a production environment, you would add the token to a blacklist
                // For now, we'll just log the logout action
                
                if (!string.IsNullOrEmpty(token))
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    try
                    {
                        var jwtToken = tokenHandler.ReadJwtToken(token);
                        var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                        
                        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                        {
                            var user = await _userRepository.GetByIdAsync(userId);
                            if (user != null)
                            {
                                _logger.LogInformation($"User {user.Email} logged out successfully");
                            }
                        }
                    }
                    catch
                    {
                        // Token might not be a valid JWT, just log generic logout
                        _logger.LogInformation("User logged out");
                    }
                }

                // In production, implement token blacklisting here
                // Example: Redis cache or database table for revoked tokens
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                // Don't throw exception for logout failures
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("role", user.Role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }
    }
}
