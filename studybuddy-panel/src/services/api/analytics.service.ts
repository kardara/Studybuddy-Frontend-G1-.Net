import { apiClient } from "@/lib/api.config";

// Enhanced interfaces for comprehensive analytics
export interface DashboardAnalytics {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  activeStudentsToday: number;
  totalQuizzesSubmitted: number;
  averageCompletionRate: number;
  totalCertificatesIssued: number;
  totalChatSessions: number;
  dailyMetrics: DailyMetric[];
  topCourses: CourseSummary[];
  recentStudents: StudentSummary[];
  revenueMetrics?: {
    totalRevenue: number;
    monthlyRevenue: number;
    subscriptionsActive: number;
  };
  systemMetrics?: {
    averageSessionTime: number;
    bounceRate: number;
    retentionRate: number;
    errorRate: number;
  };
}

export interface DailyMetric {
  date: string;
  newRegistrations: number;
  newEnrollments: number;
  quizzesCompleted: number;
  certificatesIssued: number;
  timeSpent: number;
  activeUsers: number;
}

export interface CourseSummary {
  courseId: number;
  courseName: string;
  totalEnrollments: number;
  completedStudents: number;
  completionRate: number;
  averageRating: number;
  revenueGenerated: number;
  lastActivity: string;
}

export interface StudentSummary {
  studentId: number;
  studentName: string;
  email: string;
  registrationDate: string;
  totalEnrollments: number;
  completedCourses: number;
  totalTimeSpent: number;
  averageScore: number;
  lastLogin: string;
  status: "active" | "inactive" | "blocked";
}

export interface DashboardAnalyticsRequest {
  startDate?: string;
  endDate?: string;
  includeRevenue?: boolean;
  includeSystemMetrics?: boolean;
}

// Enhanced analytics interfaces
export interface CourseAnalytics {
  courseId: number;
  title: string;
  enrollmentTrends: EnrollmentTrend[];
  completionRate: number;
  averageTimeToComplete: number;
  dropOffPoints: DropOffPoint[];
  studentEngagement: EngagementMetric[];
  revenueData: RevenueData;
  quizPerformance: QuizPerformance[];
}

export interface EnrollmentTrend {
  date: string;
  enrollments: number;
  completions: number;
  activeStudents: number;
}

export interface DropOffPoint {
  lessonId: number;
  lessonTitle: string;
  dropOffRate: number;
  averageTimeSpent: number;
}

export interface EngagementMetric {
  date: string;
  dailyActiveUsers: number;
  sessionDuration: number;
  lessonsCompleted: number;
  quizzesTaken: number;
}

export interface RevenueData {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  conversionRate: number;
}

export interface QuizPerformance {
  quizId: number;
  quizTitle: number;
  attempts: number;
  averageScore: number;
  passRate: number;
  averageTime: number;
}

export interface StudentAnalytics {
  studentId: number;
  name: string;
  learningPatterns: LearningPattern[];
  performanceMetrics: PerformanceMetric[];
  recommendedActions: string[];
  riskFactors: RiskFactor[];
}

export interface LearningPattern {
  timeOfDay: string;
  dayOfWeek: string;
  preferredDuration: number;
  completionRate: number;
}

export interface PerformanceMetric {
  subject: string;
  averageScore: number;
  improvementRate: number;
  strengthLevel: number;
  weaknessAreas: string[];
}

export interface RiskFactor {
  type: "low_engagement" | "falling_behind" | "inactive";
  severity: "low" | "medium" | "high";
  description: string;
  recommendedAction: string;
}

export interface ReportData {
  reportId: string;
  title: string;
  type: "comprehensive" | "course_performance" | "student_progress" | "revenue";
  generatedAt: string;
  generatedBy: string;
  data: unknown;
  downloadUrl?: string;
}

export const analyticsService = {
  async getDashboardAnalytics(
    request?: DashboardAnalyticsRequest
  ): Promise<DashboardAnalytics> {
    const response = await apiClient.get("/analytics/dashboard", {
      params: request,
    });
    return response.data;
  },

  async getCourseAnalytics(
    courseId: number,
    request?: Record<string, unknown>
  ): Promise<CourseAnalytics> {
    const response = await apiClient.get(`/analytics/courses/${courseId}`, {
      params: request,
    });
    return response.data;
  },

  async getStudentAnalytics(
    studentId?: number,
    request?: Record<string, unknown>
  ): Promise<StudentAnalytics | StudentAnalytics[]> {
    const endpoint = studentId
      ? `/analytics/students/${studentId}`
      : "/analytics/students";
    const response = await apiClient.get(endpoint, {
      params: request,
    });
    return response.data;
  },

  async generateReport(
    type: ReportData["type"],
    parameters: Record<string, unknown> = {}
  ): Promise<ReportData> {
    const response = await apiClient.post<ReportData>("/analytics/reports", {
      type,
      parameters,
    });
    return response.data;
  },

  async downloadReport(
    reportId: string,
    format: "pdf" | "excel" | "csv"
  ): Promise<Blob> {
    const response = await apiClient.get(
      `/analytics/reports/${reportId}/download`,
      {
        params: { format },
        responseType: "blob",
      }
    );
    return response.data;
  },

  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    liveSessions: number;
    systemLoad: number;
    errorRate: number;
  }> {
    const response = await apiClient.get("/analytics/realtime");
    return response.data;
  },

  async exportData(
    type: "students" | "courses" | "progress" | "certificates",
    format: "csv" | "excel",
    filters?: Record<string, unknown>
  ): Promise<Blob> {
    const response = await apiClient.get(`/analytics/export/${type}`, {
      params: { format, ...filters },
      responseType: "blob",
    });
    return response.data;
  },
};
