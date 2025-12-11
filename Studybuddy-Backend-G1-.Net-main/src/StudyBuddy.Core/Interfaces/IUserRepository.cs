using StudyBuddy.Core.Models.Domain;
using System.Threading.Tasks;

namespace StudyBuddy.Core.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<bool> IsEmailUniqueAsync(string email);
    }
}
