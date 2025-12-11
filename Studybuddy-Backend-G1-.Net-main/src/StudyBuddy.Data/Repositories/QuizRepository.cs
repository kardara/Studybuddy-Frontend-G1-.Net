using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using System.Threading.Tasks;

namespace StudyBuddy.Data.Repositories
{
    public class QuizRepository : Repository<Quiz>, IQuizRepository
    {
        public QuizRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Quiz?> GetQuizWithQuestionsAsync(int quizId)
        {
            return await _dbSet
                .Include(q => q.Questions)
                    .ThenInclude(qt => qt.Options)
                .FirstOrDefaultAsync(q => q.QuizId == quizId);
        }
    }
}
