namespace StudyBuddy.Core.Models.DTOs.Responses
{
    public class CertificateDto
    {
        public int CertificateId { get; set; }
        public string CertificateNumber { get; set; } = string.Empty;
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public string? CertificateUrl { get; set; }
    }
}
