import { apiClient } from "@/lib/api.config";
import { ProgressUpdateRequest, ProgressResponse } from "@/lib/types";

// Enhanced interfaces for comprehensive progress tracking
export interface DetailedProgressResponse extends ProgressResponse {
  modulesCompleted: number;
  totalModules: number;
  averageQuizScore: number;
  totalQuizzesTaken: number;
  timeSpent: number; // in minutes
  streak: number; // consecutive days
  lastActivityDate: string;
  nextLessonId?: number;
  courseThumbnail?: string;
  completionDate?: string;
  certificatesEarned: number;
}

export interface WeeklyProgressData {
  date: string;
  lessonsCompleted: number;
  timeSpent: number;
  quizzesCompleted: number;
  streak: number;
}

export interface LearningGoal {
  goalId: number;
  title: string;
  description: string;
  type: "lessons" | "courses" | "time" | "streak" | "quiz_score";
  target: number;
  current: number;
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Achievement {
  achievementId: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  earnedAt?: string;
  progress: number;
  target: number;
  isEarned: boolean;
}

export interface ProgressAnalytics {
  totalTimeSpent: number;
  averageSessionTime: number;
  mostActiveTime: string;
  completionRate: number;
  skillLevels: { [key: string]: number };
  learningVelocity: number; // lessons per week
  recommendedActions: string[];
}

export const progressService = {
  async updateProgress(
    lessonId: number,
    isCompleted: boolean,
    timeSpent?: number
  ): Promise<void> {
    const request: ProgressUpdateRequest & { timeSpent?: number } = {
      lessonId,
      isCompleted,
      ...(timeSpent && { timeSpent }),
    };
    await apiClient.post("/progress", request);
  },

  async getCourseProgress(courseId: number): Promise<ProgressResponse> {
    const response = await apiClient.get<ProgressResponse>(
      `/progress/course/${courseId}`
    );
    return response.data;
  },

  async getMyProgress(): Promise<ProgressResponse[]> {
    const response = await apiClient.get<ProgressResponse[]>(
      "/progress/my-progress"
    );
    return response.data;
  },

  async getDetailedProgress(): Promise<DetailedProgressResponse[]> {
    const response = await apiClient.get<DetailedProgressResponse[]>(
      "/progress/detailed"
    );
    return response.data;
  },

  async getWeeklyProgress(days: number = 7): Promise<WeeklyProgressData[]> {
    const response = await apiClient.get<WeeklyProgressData[]>(
      `/progress/weekly?days=${days}`
    );
    return response.data;
  },

  async getProgressAnalytics(): Promise<ProgressAnalytics> {
    const response = await apiClient.get<ProgressAnalytics>(
      "/progress/analytics"
    );
    return response.data;
  },

  async getLearningGoals(): Promise<LearningGoal[]> {
    const response = await apiClient.get<LearningGoal[]>("/progress/goals");
    return response.data;
  },

  async createLearningGoal(
    goal: Omit<LearningGoal, "goalId" | "current" | "isCompleted" | "createdAt">
  ): Promise<LearningGoal> {
    const response = await apiClient.post<LearningGoal>(
      "/progress/goals",
      goal
    );
    return response.data;
  },

  async updateLearningGoal(
    goalId: number,
    updates: Partial<LearningGoal>
  ): Promise<LearningGoal> {
    const response = await apiClient.put<LearningGoal>(
      `/progress/goals/${goalId}`,
      updates
    );
    return response.data;
  },

  async deleteLearningGoal(goalId: number): Promise<void> {
    await apiClient.delete(`/progress/goals/${goalId}`);
  },

  async getAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>(
      "/progress/achievements"
    );
    return response.data;
  },

  async resetCourseProgress(courseId: number): Promise<void> {
    await apiClient.post(`/progress/reset/${courseId}`);
  },

  async markLessonComplete(
    lessonId: number,
    timeSpent: number
  ): Promise<DetailedProgressResponse> {
    const response = await apiClient.post<DetailedProgressResponse>(
      "/progress/complete-lesson",
      {
        lessonId,
        timeSpent,
      }
    );
    return response.data;
  },

  async getNextRecommendedLesson(
    courseId?: number
  ): Promise<{ lessonId: number; courseId: number; title: string } | null> {
    const response = await apiClient.get<{
      lessonId: number;
      courseId: number;
      title: string;
    } | null>("/progress/next-lesson", {
      params: courseId ? { courseId } : {},
    });
    return response.data;
  },

  async exportProgressReport(format: "pdf" | "csv" | "excel"): Promise<Blob> {
    const response = await apiClient.get(`/progress/export?format=${format}`, {
      responseType: "blob",
    });
    return response.data;
  },
};
