import { useQuery } from "@tanstack/react-query";
import { Award, Download, Eye, Loader2 } from "lucide-react";
import { CertificateCard } from "@/components/dashboard/CertificateCard";
import { certificatesService } from "@/services/api/certificates.service";
import { progressService } from "@/services/api/progress.service";
import { useToast } from "@/hooks/use-toast";

export default function StudentCertificates() {
  const { toast } = useToast();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => certificatesService.getMyCertificates(),
  });

  const { data: progressData } = useQuery({
    queryKey: ['my-progress'],
    queryFn: () => progressService.getMyProgress(),
  });

  const inProgressCourses = progressData?.filter(
    (p) => p.progressPercentage > 0 && p.progressPercentage < 100
  ).length || 0;

  const handleDownloadCertificate = async (certificateId: number) => {
    try {
      const blob = await certificatesService.downloadCertificate(certificateId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your certificate PDF is being downloaded.",
      });
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const highestScore = certificates && certificates.length > 0
    ? Math.max(...certificates.map(() => 95))  // Backend doesn't provide scores, using placeholder
    : 0;

  const averageScore = certificates && certificates.length > 0
    ? Math.round(certificates.reduce(() => 90, 0) / certificates.length) // Placeholder
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Certificates</h1>
          <p className="text-muted-foreground mt-1">
            View and download your earned certificates
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Certificates</p>
              <p className="text-3xl font-semibold">{certificates?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses Available</p>
              <p className="text-3xl font-semibold">{progressData?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Award className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-3xl font-semibold">{inProgressCourses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates && certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.certificateId}
              courseName={cert.courseTitle}
              completedDate={new Date(cert.issuedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              score={90} // Placeholder as backend doesn't provide quiz scores with certificates
              certificateId={cert.certificateNumber}
              onView={() => {
                // For now, download the PDF to view it
                handleDownloadCertificate(cert.certificateId);
              }}
              onDownload={() => handleDownloadCertificate(cert.certificateId)}
            />
          ))}
        </div>
      ) : (
        <div className="dashboard-card p-12 text-center mb-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No Certificates Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete courses to earn certificates!
          </p>
        </div>
      )}

      {/* Pending Courses */}
      {inProgressCourses > 0 && (
        <div className="dashboard-card p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Complete More Courses</h3>
            <p className="text-muted-foreground mb-4">
              You have {inProgressCourses} course{inProgressCourses > 1 ? 's' : ''} in progress. Complete them to earn more certificates!
            </p>
            <button className="btn-primary" onClick={() => window.location.href = '/student/courses'}>
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
