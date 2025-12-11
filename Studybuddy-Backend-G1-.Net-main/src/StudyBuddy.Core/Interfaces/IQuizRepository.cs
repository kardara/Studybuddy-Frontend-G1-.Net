using StudyBuddy.Core.Models.Domain;
using System.Threading.Tasks;

namespace StudyBuddy.Core.Interfaces
{
    public interface IQuizRepository : IRepository<Quiz>
    {
        Task<Quiz?> GetQuizWithQuestionsAsync(int quizId);
    }
}
