import { apiClient } from "./apiClient";
import type { CreateProjectRequest, UpdateProjectRequest, ProjectResponse } from "./contracts/project";

export const projectApi = {
  getAll: () =>
    apiClient.get<ProjectResponse[]>("/api/projects"),

  create: (data: CreateProjectRequest) =>
    apiClient.post<ProjectResponse>("/api/projects", data),

  update: (projectId: string, data: UpdateProjectRequest) =>
    apiClient.put<ProjectResponse>(`/api/projects/${projectId}`, data),

  delete: (projectId: string) =>
    apiClient.delete<void>(`/api/projects/${projectId}`),
};