using System.IO;

namespace StudyBuddy.Core.Interfaces
{
    public interface IPdfGenerator
    {
        Task<byte[]> GenerateCertificatePdfAsync(string studentName, string courseName, string certificateNumber, DateTime issuedAt);
    }
}