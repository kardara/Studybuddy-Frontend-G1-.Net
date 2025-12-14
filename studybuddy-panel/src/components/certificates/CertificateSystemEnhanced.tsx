import React, { useState, useEffect } from 'react';
import {
    Download,
    Mail,
    Share2,
    Eye,
    Award,
    Calendar,
    User,
    BookOpen,
    CheckCircle,
    Clock,
    ExternalLink,
    Copy,
    QrCode,
    Shield,
    X
} from 'lucide-react';
import { CertificateDto } from '@/lib/types';
import { certificatesService } from '@/services/api/certificates.service';
import { ProgressBar } from '@/components/dashboard/ProgressBar';

interface CertificateSystemEnhancedProps {
    courseId?: number;
    showGeneration?: boolean;
    compact?: boolean;
}

export function CertificateSystemEnhanced({
    courseId,
    showGeneration = false,
    compact = false
}: CertificateSystemEnhancedProps) {
    const [certificates, setCertificates] = useState<CertificateDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState<CertificateDto | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<CertificateDto | null>(null);

    useEffect(() => {
        loadCertificates();
    }, [courseId]);

    const loadCertificates = async () => {
        try {
            const data = await certificatesService.getMyCertificates();
            const filteredData = courseId
                ? data.filter(cert => cert.courseTitle && cert.courseTitle.includes(courseId.toString()))
                : data;
            setCertificates(filteredData);
        } catch (error) {
            console.error('Error loading certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCertificate = async (certificate: CertificateDto) => {
        try {
            // In a real implementation, this would download the actual certificate file
            const link = document.createElement('a');
            link.href = certificate.certificateUrl || '#';
            link.download = `certificate-${certificate.certificateNumber}.pdf`;
            link.click();
        } catch (error) {
            console.error('Error downloading certificate:', error);
        }
    };

    const shareCertificate = async (certificate: CertificateDto) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Certificate: ${certificate.courseTitle}`,
                    text: `I earned a certificate in ${certificate.courseTitle}!`,
                    url: `${window.location.origin}/verify/${certificate.certificateNumber}`
                });
            } catch (error) {
                // Fallback to clipboard
                copyToClipboard(certificate);
            }
        } else {
            copyToClipboard(certificate);
        }
    };

    const copyToClipboard = (certificate: CertificateDto) => {
        const shareText = `I earned a certificate in ${certificate.courseTitle}! Verify it at: ${window.location.origin}/verify/${certificate.certificateNumber}`;
        navigator.clipboard.writeText(shareText);
    };

    const verifyCertificate = async (certificateNumber: string) => {
        setVerifying(true);
        try {
            const result = await certificatesService.verifyCertificate(certificateNumber);
            setVerificationResult(result);
        } catch (error) {
            console.error('Error verifying certificate:', error);
            setVerificationResult(null);
        } finally {
            setVerifying(false);
        }
    };

    const sendCertificateEmail = async (certificate: CertificateDto) => {
        try {
            // In a real implementation, this would trigger an email send
            console.log('Sending certificate email for:', certificate.certificateNumber);
            // await certificatesService.sendCertificateEmail(certificate.certificateId);
        } catch (error) {
            console.error('Error sending certificate email:', error);
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isExpired = (certificate: CertificateDto): boolean => {
        if (!certificate.expiryDate) return false;
        return new Date(certificate.expiryDate) < new Date();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Compact view for dashboard
    if (compact) {
        if (certificates.length === 0) {
            return (
                <div className="text-center py-6">
                    <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No certificates yet</p>
                    <p className="text-xs text-muted-foreground">Complete courses to earn certificates</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {certificates.slice(0, 3).map((certificate) => (
                    <div key={certificate.certificateId} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="p-2 bg-chart-4/10 rounded-lg">
                            <Award className="w-4 h-4 text-chart-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{certificate.courseTitle}</p>
                            <p className="text-xs text-muted-foreground">{certificate.studentName}</p>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => downloadCertificate(certificate)}
                                className="p-1 hover:bg-muted rounded"
                                title="Download"
                            >
                                <Download className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => shareCertificate(certificate)}
                                className="p-1 hover:bg-muted rounded"
                                title="Share"
                            >
                                <Share2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
                {certificates.length > 3 && (
                    <button className="text-sm text-primary hover:underline block text-center">
                        View all {certificates.length} certificates
                    </button>
                )}
            </div>
        );
    }

    // Full certificate management interface
    return (
        <div className="space-y-6">
            {/* Certificate Generation Section */}
            {showGeneration && courseId && (
                <div className="dashboard-card p-6 bg-gradient-to-r from-chart-4/5 to-chart-4/10 border-chart-4/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-chart-4/10 rounded-lg">
                            <Award className="w-6 h-6 text-chart-4" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Ready for Certificate?</h3>
                            <p className="text-muted-foreground">Complete the course requirements to earn your certificate</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Course Completion</span>
                                <span>100%</span>
                            </div>
                            <ProgressBar value={100} className="mb-2" />
                            <p className="text-xs text-muted-foreground">
                                ✓ All lessons completed • ✓ Quiz passed • Ready to generate certificate
                            </p>
                        </div>
                        <button className="btn-primary">
                            <Award className="w-4 h-4" />
                            Generate Certificate
                        </button>
                    </div>
                </div>
            )}

            {/* Certificates Grid */}
            {certificates.length === 0 ? (
                <div className="dashboard-card p-12 text-center">
                    <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Complete courses and pass quizzes to earn certificates
                    </p>
                    {!compact && (
                        <button className="btn-primary">
                            <BookOpen className="w-4 h-4" />
                            Browse Courses
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                        <div key={certificate.certificateId} className="dashboard-card p-6 hover:shadow-lg transition-shadow">
                            {/* Certificate Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-chart-4/10 rounded-lg">
                                    <Award className="w-6 h-6 text-chart-4" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => downloadCertificate(certificate)}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                        title="Download Certificate"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => shareCertificate(certificate)}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                        title="Share Certificate"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedCertificate(certificate)}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Certificate Info */}
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-lg leading-tight">{certificate.courseTitle}</h4>
                                    <p className="text-sm text-muted-foreground">{certificate.studentName}</p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    Issued {formatDate(certificate.issueDate)}
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                        #{certificate.certificateNumber}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(certificate)}
                                        className="p-1 hover:bg-muted rounded"
                                        title="Copy Certificate Number"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>

                                {certificate.expiryDate && (
                                    <div className={`flex items-center gap-2 text-sm ${isExpired(certificate) ? 'text-destructive' : 'text-warning'
                                        }`}>
                                        <Clock className="w-4 h-4" />
                                        {isExpired(certificate) ? 'Expired' : 'Expires'} {formatDate(certificate.expiryDate)}
                                    </div>
                                )}

                                <div className="pt-3 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-success" />
                                        <span className="text-sm text-success font-medium">Verified Certificate</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This certificate can be verified by employers and institutions
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Certificate Detail Modal */}
            {selectedCertificate && (
                <div className="modal-overlay" onClick={() => setSelectedCertificate(null)}>
                    <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Certificate Details</h2>
                                <button
                                    onClick={() => setSelectedCertificate(null)}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Certificate Preview */}
                            <div className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 rounded-lg p-8 mb-6 border-2 border-chart-4/20">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <Award className="w-8 h-8 text-chart-4" />
                                        <h3 className="text-2xl font-bold text-chart-4">StudyBuddy Certificate</h3>
                                    </div>

                                    <p className="text-muted-foreground mb-6">This certifies that</p>

                                    <h4 className="text-3xl font-bold mb-4">{selectedCertificate.studentName}</h4>

                                    <p className="text-muted-foreground mb-2">has successfully completed</p>

                                    <h5 className="text-xl font-semibold mb-6">{selectedCertificate.courseTitle}</h5>

                                    <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                                        <div>
                                            <p>Issued</p>
                                            <p className="font-medium">{formatDate(selectedCertificate.issueDate)}</p>
                                        </div>
                                        {selectedCertificate.expiryDate && (
                                            <div>
                                                <p>Expires</p>
                                                <p className="font-medium">{formatDate(selectedCertificate.expiryDate)}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p>Certificate ID</p>
                                            <p className="font-mono font-medium">#{selectedCertificate.certificateNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => downloadCertificate(selectedCertificate)}
                                    className="btn-primary flex-1"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => sendCertificateEmail(selectedCertificate)}
                                    className="btn-outline flex-1"
                                >
                                    <Mail className="w-4 h-4" />
                                    Email Certificate
                                </button>
                                <button
                                    onClick={() => shareCertificate(selectedCertificate)}
                                    className="btn-outline"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            </div>

                            {/* Verification */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="flex items-center gap-2 mb-3">
                                    <QrCode className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Verify Certificate</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Employers and institutions can verify this certificate using the ID number or QR code.
                                </p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={selectedCertificate.certificateNumber}
                                        readOnly
                                        className="input-field flex-1 font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(selectedCertificate)}
                                        className="btn-outline"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button className="btn-outline">
                                        <ExternalLink className="w-4 h-4" />
                                        Verify Online
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
