using StudyBuddy.Core.Interfaces;
using StudyBuddy.Core.Configuration;
using System.Text;

namespace StudyBuddy.Services.Implementations
{
    public class PdfGenerator : IPdfGenerator
    {
        private readonly CertificateSettings _certificateSettings;

        public PdfGenerator(CertificateSettings certificateSettings)
        {
            _certificateSettings = certificateSettings;
        }

        public async Task<byte[]> GenerateCertificatePdfAsync(string studentName, string courseName, string certificateNumber, DateTime issuedAt)
        {
            // Generate HTML content for the certificate
            var html = GenerateCertificateHtml(studentName, courseName, certificateNumber, issuedAt);

            // For now, return the HTML as bytes - in production, you'd use a proper HTML to PDF library
            // like iText7, PuppeteerSharp, or QuestPDF
            return Encoding.UTF8.GetBytes(html);
        }

        private string GenerateCertificateHtml(string studentName, string courseName, string certificateNumber, DateTime issuedAt)
        {
            var logoHtml = string.IsNullOrEmpty(_certificateSettings.LogoUrl)
                ? ""
                : $"<img src='{_certificateSettings.LogoUrl}' alt='StudyBuddy Logo' class='logo' />";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Certificate of Completion</title>
    <style>
        body {{
            font-family: '{_certificateSettings.FontFamily}';
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
        }}
        .certificate {{
            background: white;
            padding: 60px;
            border: 5px solid gold;
            border-radius: 15px;
            max-width: 900px;
            margin: auto;
            box-shadow: 0 15px 50px rgba(0,0,0,0.3);
        }}
        .logo {{
            height: 80px;
            margin-bottom: 30px;
        }}
        .title {{
            font-size: 48px;
            color: #333;
            margin: 30px 0;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }}
        .subtitle {{
            font-size: 24px;
            color: #666;
            margin: 30px 0;
        }}
        .student-name {{
            font-size: 36px;
            color: #764ba2;
            margin: 40px 0;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        .course-name {{
            font-size: 28px;
            color: #667eea;
            margin: 30px 0;
            font-weight: 600;
        }}
        .info {{
            margin: 40px 0;
            font-size: 18px;
            line-height: 1.6;
        }}
        .info strong {{
            color: #333;
        }}
        .footer {{
            margin-top: 50px;
            font-size: 16px;
            color: #999;
        }}
        .decorative-line {{
            width: 200px;
            height: 2px;
            background: linear-gradient(to right, #667eea, #764ba2);
            margin: 30px auto;
        }}
    </style>
</head>
<body>
    <div class='certificate'>
        {logoHtml}
        <div class='title'>Certificate of Completion</div>
        <div class='decorative-line'></div>
        <div class='subtitle'>This certifies that</div>
        <div class='student-name'>{studentName}</div>
        <div class='subtitle'>has successfully completed the course</div>
        <div class='course-name'>{courseName}</div>
        <div class='info'>
            <p><strong>Date Issued:</strong> {issuedAt:MMMM dd, yyyy}</p>
            <p><strong>Certificate No:</strong> {certificateNumber}</p>
        </div>
        <div class='footer'>
            <p>StudyBuddy Learning Platform</p>
            <p style='font-size: 14px; color: #ccc;'>Excellence in Online Education</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}