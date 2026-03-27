import { apiClient } from "../apiClient";
import type { ActivityResponse } from "../contracts/activity";

export const activityApi = {
  getByProject: (projectId: string, limit = 20) =>
    apiClient.get<ActivityResponse[]>(
      `/api/projects/${projectId}/activities?limit=${limit}`,
    ),

  getByIssue: (projectId: string, issueId: string, limit = 20) =>
    apiClient.get<ActivityResponse[]>(
      `/api/projects/${projectId}/issues/${issueId}/activities?limit=${limit}`,
    ),
};
