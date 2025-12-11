using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddy.Data.Repositories
{
    public class CourseRepository : Repository<Course>, ICourseRepository
    {
        public CourseRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Course>> GetPublishedCoursesAsync()
        {
            return await _dbSet
                .Where(c => c.Status == "Published")
                .Include(c => c.Creator)
                .ToListAsync();
        }

        public async Task<Course?> GetCourseWithDetailsAsync(int courseId)
        {
            return await _dbSet
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Lessons)
                .Include(c => c.Creator)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);
        }
    }
}
