import { apiClient } from "@/lib/api.config";
import {
  EnrollmentRequest,
  EnrollmentResponse,
  CourseListDto,
} from "@/lib/types";

export const enrollmentsService = {
  async enroll(courseId: number): Promise<EnrollmentResponse> {
    const request: EnrollmentRequest = { courseId };
    const response = await apiClient.post<EnrollmentResponse>(
      "/enrollments",
      request
    );
    return response.data;
  },

  async getMyCourses(): Promise<EnrollmentResponse[]> {
    const response = await apiClient.get<EnrollmentResponse[]>(
      "/student/enrollments"
    );
    return response.data;
  },

  async checkEnrollment(courseId: number): Promise<boolean> {
    const response = await apiClient.get<{ isEnrolled: boolean }>(
      `/enrollments/check/${courseId}`
    );
    return response.data.isEnrolled;
  },

  async unenroll(courseId: number): Promise<void> {
    await apiClient.delete(`/enrollments/${courseId}`);
  },

  async getAvailableCourses(): Promise<CourseListDto[]> {
    // Get courses that are published and available for enrollment
    const response = await apiClient.get<CourseListDto[]>("/courses/available");
    return response.data;
  },

  async getFeaturedCourses(): Promise<CourseListDto[]> {
    // Get featured/popular courses
    const response = await apiClient.get<CourseListDto[]>("/courses/featured");
    return response.data;
  },
};
