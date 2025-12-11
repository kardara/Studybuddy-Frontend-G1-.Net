using StudyBuddy.Core.Models.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddy.Core.Interfaces
{
    public interface IEnrollmentRepository : IRepository<Enrollment>
    {
        Task<IEnumerable<Enrollment>> GetStudentEnrollmentsAsync(int studentId);
        Task<Enrollment?> GetEnrollmentAsync(int studentId, int courseId);
    }
}
