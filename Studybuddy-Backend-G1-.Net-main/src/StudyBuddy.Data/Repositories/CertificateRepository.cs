using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Models.Domain;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudyBuddy.Data.Repositories
{
    public class CertificateRepository : Repository<Certificate>, ICertificateRepository
    {
        public CertificateRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Certificate>> GetStudentCertificatesAsync(int studentId)
        {
            return await _dbSet
                .Where(c => c.StudentId == studentId)
                .Include(c => c.Course)
                .ToListAsync();
        }
    }
}
