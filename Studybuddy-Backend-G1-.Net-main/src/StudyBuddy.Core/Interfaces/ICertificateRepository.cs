using StudyBuddy.Core.Models.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudyBuddy.Core.Interfaces
{
    public interface ICertificateRepository : IRepository<Certificate>
    {
        Task<IEnumerable<Certificate>> GetStudentCertificatesAsync(int studentId);
    }
}
