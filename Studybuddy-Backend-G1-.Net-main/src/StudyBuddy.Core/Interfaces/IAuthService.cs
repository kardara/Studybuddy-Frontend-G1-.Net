using StudyBuddy.Core.Models.DTOs.Requests;
using StudyBuddy.Core.Models.DTOs.Responses;
using System.Threading.Tasks;

namespace StudyBuddy.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<bool> SendPasswordResetEmailAsync(string email);
        Task<bool> VerifyResetTokenAsync(string resetToken);
        Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task LogoutAsync(string token);
    }
}
