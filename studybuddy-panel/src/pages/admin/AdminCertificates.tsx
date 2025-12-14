import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, RefreshCw, Eye, Award } from "lucide-react";
import { certificatesService } from "@/services/api/certificates.service";
import { CertificateDto } from "@/lib/types";

export default function AdminCertificates() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['admin-certificates'],
    queryFn: () => certificatesService.getAllCertificates(),
  });

  const getStatusBadge = () => {
    return <span className="badge badge-success">Valid</span>;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificate Management</h1>
          <p className="text-muted-foreground mt-1">
            View, validate, and manage issued certificates
          </p>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-2 dashboard-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by certificate ID, student name, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Issued</p>
              <p className="text-2xl font-semibold">{certificates?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-semibold">
                {certificates?.filter(cert =>
                  new Date(cert.issuedAt) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                ).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Issued Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates?.map((cert) => (
              <tr key={cert.certificateId}>
                <td>
                  <span className="font-mono text-sm">{cert.certificateNumber}</span>
                </td>
                <td>
                  <div>
                    <p className="font-medium">{cert.studentName}</p>
                    <p className="text-sm text-muted-foreground">{cert.studentEmail}</p>
                  </div>
                </td>
                <td>{cert.courseTitle}</td>
                <td className="text-muted-foreground">
                  {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td>{getStatusBadge()}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="View Certificate"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing 1-{certificates?.length || 0} of {certificates?.length || 0} certificates
          </p>
          <div className="flex gap-2">
            <button className="btn-outline py-2 px-3">Previous</button>
            <button className="btn-primary py-2 px-3">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
