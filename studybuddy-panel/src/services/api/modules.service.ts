import { apiClient } from "@/lib/api.config";

export interface CreateModuleRequest {
  title: string;
  description?: string;
  sequenceOrder?: number;
  estimatedDurationMinutes?: number;
}

export interface UpdateModuleRequest {
  moduleId: number;
  title: string;
  description?: string;
  sequenceOrder?: number;
  estimatedDurationMinutes?: number;
}

export interface ModuleDto {
  moduleId: number;
  courseId: number;
  moduleNumber: number;
  title: string;
  description?: string;
  estimatedDurationMinutes?: number;
  sequenceOrder?: number;
  createdAt: string;
  createdManually?: boolean;
}

export const modulesService = {
  // Get all modules for a course
  async getModulesByCourse(courseId: number): Promise<ModuleDto[]> {
    const response = await apiClient.get<ModuleDto[]>(
      `/courses/${courseId}/modules`
    );
    return response.data;
  },

  // Get a specific module
  async getModule(courseId: number, moduleId: number): Promise<ModuleDto> {
    const response = await apiClient.get<ModuleDto>(
      `/courses/${courseId}/modules/${moduleId}`
    );
    return response.data;
  },

  // Create a new module
  async createModule(
    courseId: number,
    moduleData: CreateModuleRequest
  ): Promise<ModuleDto> {
    const response = await apiClient.post<ModuleDto>(
      `/courses/${courseId}/modules`,
      moduleData
    );
    return response.data;
  },

  // Update a module
  async updateModule(
    courseId: number,
    moduleData: UpdateModuleRequest
  ): Promise<ModuleDto> {
    const response = await apiClient.put<ModuleDto>(
      `/courses/${courseId}/modules/${moduleData.moduleId}`,
      {
        title: moduleData.title,
        description: moduleData.description,
        sequenceOrder: moduleData.sequenceOrder,
        estimatedDurationMinutes: moduleData.estimatedDurationMinutes,
      }
    );
    return response.data;
  },

  // Delete a module
  async deleteModule(courseId: number, moduleId: number): Promise<void> {
    await apiClient.delete(`/courses/${courseId}/modules/${moduleId}`);
  },
};
