using StudyBuddy.Core.Models.Domain;
using StudyBuddy.Core.Models.DTOs.Responses;
using System.Threading.Tasks;

namespace StudyBuddy.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(User user, string password);
        Task<AuthResponse?> LoginAsync(string email, string password);
    }
}
