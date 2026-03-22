import { apiClient } from "./apiClient";
import type {
  CreateIssueRequest,
  UpdateIssueRequest,
  IssueResponse,
} from "./contracts/issue";

export const issueApi = {
  getAll: (projectId: string) =>
    apiClient.get<IssueResponse[]>(`/api/projects/${projectId}/issues`),

  getAssigned: () =>
  apiClient.get<IssueResponse[]>("/api/issues/assigned"),

  create: (projectId: string, data: CreateIssueRequest) =>
    apiClient.post<IssueResponse>(`/api/projects/${projectId}/issues`, data),

  update: (projectId: string, issueId: string, data: UpdateIssueRequest) =>
    apiClient.put<IssueResponse>(
      `/api/projects/${projectId}/issues/${issueId}`,
      data,
    ),

  delete: (projectId: string, issueId: string) =>
    apiClient.delete<void>(`/api/projects/${projectId}/issues/${issueId}`),
};
