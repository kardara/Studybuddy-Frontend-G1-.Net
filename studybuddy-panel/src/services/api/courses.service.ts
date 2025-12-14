import { apiClient } from "@/lib/api.config";
import {
  CourseListDto,
  CourseDetailDto,
  ModuleDto,
  LessonDto,
  CreateModuleRequest,
  UpdateModuleRequest,
  CreateLessonRequest,
  UpdateLessonRequest,
} from "@/lib/types";

export interface CreateCourseRequest {
  title: string;
  description: string;
  category?: string;
  level?: string;
  estimatedDurationHours?: number;
  prerequisites?: string;
  learningObjectives?: string;
  thumbnailUrl?: string;
  sourcePdfUrl?: string;
  generatedContent?: string;
  createdBy: number;
}

export interface UpdateCourseRequest {
  courseId: number;
  title: string;
  description: string;
  category?: string;
  level?: string;
  estimatedDurationHours?: number;
  prerequisites?: string;
  learningObjectives?: string;
  thumbnailUrl?: string;
}

export interface ContentGenerationResponse {
  success: boolean;
  message: string;
  modules?: ModuleDto[];
  lessons?: LessonDto[];
}

export interface QuizGenerationResponse {
  success: boolean;
  message: string;
  quizId?: number;
}

export const coursesService = {
  // Course Management
  async getPublishedCourses(): Promise<CourseListDto[]> {
    const response = await apiClient.get<CourseListDto[]>("/courses");
    return response.data;
  },

  async getCourseById(id: number): Promise<CourseDetailDto> {
    const response = await apiClient.get<CourseDetailDto>(`/courses/${id}`);
    return response.data;
  },

  async searchCourses(query: string): Promise<CourseListDto[]> {
    const response = await apiClient.get<CourseListDto[]>("/courses/search", {
      params: { q: query },
    });
    return response.data;
  },

  async getAllCourses(): Promise<CourseListDto[]> {
    const response = await apiClient.get<CourseListDto[]>("/courses/admin/all");
    return response.data;
  },

  async createCourse(courseData: CreateCourseRequest): Promise<CourseListDto> {
    const response = await apiClient.post<CourseListDto>(
      "/courses",
      courseData
    );
    return response.data;
  },

  async updateCourse(courseData: UpdateCourseRequest): Promise<CourseListDto> {
    const { courseId, ...updateData } = courseData;
    const response = await apiClient.put<CourseListDto>(
      `/courses/${courseId}`,
      updateData
    );
    return response.data;
  },

  async deleteCourse(courseId: number): Promise<void> {
    await apiClient.delete(`/courses/${courseId}`);
  },

  async publishCourse(courseId: number): Promise<CourseListDto> {
    const response = await apiClient.post<CourseListDto>(
      `/courses/${courseId}/publish`,
      {}
    );
    return response.data;
  },

  async unpublishCourse(courseId: number): Promise<CourseListDto> {
    const response = await apiClient.post<CourseListDto>(
      `/courses/${courseId}/unpublish`,
      {}
    );
    return response.data;
  },

  async archiveCourse(courseId: number): Promise<CourseListDto> {
    await this.unpublishCourse(courseId);
    return {} as CourseListDto;
  },

  async duplicateCourse(courseId: number): Promise<CourseListDto> {
    const originalCourse = await this.getCourseById(courseId);
    const duplicatedCourse = await this.createCourse({
      title: `${originalCourse.title} (Copy)`,
      description: originalCourse.description,
      category: originalCourse.category,
      level: originalCourse.level,
      estimatedDurationHours: originalCourse.estimatedDurationHours,
      prerequisites: originalCourse.prerequisites,
      learningObjectives: originalCourse.learningObjectives,
      thumbnailUrl: originalCourse.thumbnailUrl,
      createdBy: 1, // Default admin user
    });
    return duplicatedCourse;
  },

  // Module Management
  async getModulesByCourse(courseId: number): Promise<ModuleDto[]> {
    const response = await apiClient.get<ModuleDto[]>(
      `/courses/${courseId}/modules`
    );
    return response.data;
  },

  async createModule(moduleData: CreateModuleRequest): Promise<ModuleDto> {
    const response = await apiClient.post<ModuleDto>("/modules", moduleData);
    return response.data;
  },

  async updateModule(moduleData: UpdateModuleRequest): Promise<ModuleDto> {
    const { moduleId, ...updateData } = moduleData;
    const response = await apiClient.put<ModuleDto>(
      `/modules/${moduleId}`,
      updateData
    );
    return response.data;
  },

  async deleteModule(moduleId: number): Promise<void> {
    await apiClient.delete(`/modules/${moduleId}`);
  },

  async reorderModules(courseId: number, moduleIds: number[]): Promise<void> {
    await apiClient.put(`/courses/${courseId}/modules/reorder`, { moduleIds });
  },

  // Lesson Management
  async getLessonsByModule(moduleId: number): Promise<LessonDto[]> {
    const response = await apiClient.get<LessonDto[]>(
      `/modules/${moduleId}/lessons`
    );
    return response.data;
  },

  async createLesson(lessonData: CreateLessonRequest): Promise<LessonDto> {
    const response = await apiClient.post<LessonDto>("/lessons", lessonData);
    return response.data;
  },

  async updateLesson(lessonData: UpdateLessonRequest): Promise<LessonDto> {
    const { lessonId, ...updateData } = lessonData;
    const response = await apiClient.put<LessonDto>(
      `/lessons/${lessonId}`,
      updateData
    );
    return response.data;
  },

  async deleteLesson(lessonId: number): Promise<void> {
    await apiClient.delete(`/lessons/${lessonId}`);
  },

  async reorderLessons(moduleId: number, lessonIds: number[]): Promise<void> {
    await apiClient.put(`/modules/${moduleId}/lessons/reorder`, { lessonIds });
  },

  // Content Generation
  async generateContentFromPDF(
    courseId: number,
    pdfUrl: string
  ): Promise<ContentGenerationResponse> {
    const response = await apiClient.post(
      `/courses/${courseId}/generate-from-pdf`,
      {
        pdfUrl,
      }
    );
    return response.data;
  },

  async generateQuizFromContent(
    courseId: number
  ): Promise<QuizGenerationResponse> {
    const response = await apiClient.post(
      `/courses/${courseId}/generate-quizzes`,
      {}
    );
    return response.data;
  },

  // File Upload
  async uploadContentFile(
    file: File,
    type: "video" | "pdf" | "image"
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await apiClient.post("/content/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
