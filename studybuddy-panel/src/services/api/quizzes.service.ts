import { apiClient } from "@/lib/api.config";
import {
  QuizDto,
  QuizSubmissionRequest,
  QuizResultDto,
  QuizAttemptDto,
  CreateQuizRequest,
  UpdateQuizRequest,
  CreateQuestionRequest,
} from "@/lib/types";

export interface StudentQuizAttempt {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  courseTitle: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  totalQuestions: number;
  correctAnswers: number;
  status: "in_progress" | "completed" | "submitted";
  timeSpent: number;
}

export interface QuizListItem {
  quizId: number;
  title: string;
  description?: string;
  courseTitle: string;
  courseId: number;
  questionCount: number;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const quizzesService = {
  // Get quiz with questions
  async getQuiz(id: number): Promise<QuizDto> {
    const response = await apiClient.get<QuizDto>(`/quizzes/${id}`);
    return response.data;
  },

  // Alias for getQuiz
  async getQuizById(id: number): Promise<QuizDto> {
    return this.getQuiz(id);
  },

  // Get all quizzes for admin
  async getAllQuizzes(): Promise<QuizListItem[]> {
    const response = await apiClient.get<QuizListItem[]>("/quizzes/admin/all");
    return response.data;
  },

  // Get quizzes by course
  async getQuizzesByCourse(courseId: number): Promise<QuizDto[]> {
    const response = await apiClient.get<QuizDto[]>(
      `/quizzes/course/${courseId}`
    );
    return response.data;
  },

  // Create new quiz
  async createQuiz(quizData: CreateQuizRequest): Promise<QuizDto> {
    const response = await apiClient.post<QuizDto>("/quizzes", quizData);
    return response.data;
  },

  // Update existing quiz
  async updateQuiz(quizData: UpdateQuizRequest): Promise<QuizDto> {
    const { quizId, ...updateData } = quizData;
    const response = await apiClient.put<QuizDto>(
      `/quizzes/${quizId}`,
      updateData
    );
    return response.data;
  },

  // Delete quiz
  async deleteQuiz(quizId: number): Promise<void> {
    await apiClient.delete(`/quizzes/${quizId}`);
  },

  // Toggle quiz active status
  async toggleQuizStatus(quizId: number, isActive: boolean): Promise<QuizDto> {
    const response = await apiClient.patch<QuizDto>(
      `/quizzes/${quizId}/status`,
      {
        isActive,
      }
    );
    return response.data;
  },

  // Get student quiz attempts
  async getStudentQuizAttempts(): Promise<StudentQuizAttempt[]> {
    // Get current user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('User not authenticated');

    const user = JSON.parse(userStr);
    const response = await apiClient.get<StudentQuizAttempt[]>(
      `/quizzes/student/${user.userId}`
    );
    return response.data;
  },

  // Get quiz attempts for admin
  async getQuizAttempts(quizId: number): Promise<QuizAttemptDto[]> {
    const response = await apiClient.get<QuizAttemptDto[]>(
      `/quizzes/${quizId}/attempts`
    );
    return response.data;
  },

  // Submit quiz answers
  async submitQuiz(
    quizId: number,
    submission: QuizSubmissionRequest
  ): Promise<QuizResultDto> {
    const response = await apiClient.post<QuizResultDto>(
      `/quizzes/${quizId}/submit`,
      submission
    );
    return response.data;
  },

  // Get attempt result
  async getAttemptResult(attemptId: number): Promise<QuizResultDto> {
    const response = await apiClient.get<QuizResultDto>(
      `/quizzes/attempts/${attemptId}`
    );
    return response.data;
  },

  // Start quiz attempt
  async startQuizAttempt(quizId: number): Promise<QuizAttemptDto> {
    const response = await apiClient.post<QuizAttemptDto>(
      `/quizzes/${quizId}/start`,
      {}
    );
    return response.data;
  },

  // Get quiz statistics for admin
  async getQuizStatistics(quizId: number): Promise<{
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    questionStatistics: Array<{
      questionId: number;
      questionText: string;
      correctAnswers: number;
      totalAnswers: number;
      accuracyRate: number;
    }>;
  }> {
    const response = await apiClient.get(`/quizzes/${quizId}/statistics`);
    return response.data;
  },

  // Generate quiz from course content using AI
  async generateQuizFromContent(
    courseId: number,
    options?: {
      questionCount?: number;
      difficulty?: "easy" | "medium" | "hard";
      questionTypes?: string[];
    }
  ): Promise<{ success: boolean; message: string; quizId?: number }> {
    const response = await apiClient.post(`/quizzes/generate-from-content`, {
      courseId,
      ...options,
    });
    return response.data;
  },

  // Bulk operations
  async bulkDeleteQuizzes(quizIds: number[]): Promise<void> {
    await apiClient.delete("/quizzes/bulk", { data: { quizIds } });
  },

  async bulkToggleStatus(quizIds: number[], isActive: boolean): Promise<void> {
    await apiClient.patch("/quizzes/bulk/status", { quizIds, isActive });
  },
};
