using System;
using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Core.Models.Domain
{
    public class CertificateTemplate
    {
        [Key]
        public int TemplateId { get; set; }
        [Required]
        [MaxLength(300)]
        public string TemplateName { get; set; } = string.Empty;
        public string? TemplateHtml { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
