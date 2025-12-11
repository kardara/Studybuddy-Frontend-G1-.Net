using StudyBuddy.Core.Models.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddy.Core.Interfaces
{
    public interface ICourseRepository : IRepository<Course>
    {
        Task<IEnumerable<Course>> GetPublishedCoursesAsync();
        Task<Course?> GetCourseWithDetailsAsync(int courseId);
    }
}
