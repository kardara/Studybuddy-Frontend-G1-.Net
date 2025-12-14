import { apiClient } from "@/lib/api.config";
import { CertificateDto } from "@/lib/types";

export const certificatesService = {
  async issueCertificate(courseId: number): Promise<CertificateDto> {
    const response = await apiClient.post<CertificateDto>(
      "/certificates/issue",
      { courseId }
    );
    return response.data;
  },

  async getMyCertificates(): Promise<CertificateDto[]> {
    const response = await apiClient.get<CertificateDto[]>(
      "/certificates/my-certificates"
    );
    return response.data;
  },

  async verifyCertificate(certificateNumber: string): Promise<CertificateDto> {
    const response = await apiClient.get<CertificateDto>(
      `/certificates/verify/${certificateNumber}`
    );
    return response.data;
  },
};
