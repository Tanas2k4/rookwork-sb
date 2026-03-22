import { apiClient } from "./apiClient";
import type { WorkStatsResponse, LogWorkRequest, WorkLogResponse } from "./contracts/worklog";

export const workLogApi = {
  getStats: (period: "weekly" | "monthly") =>
    apiClient.get<WorkStatsResponse>(`/api/work-logs/stats?period=${period}`),

  logWork: (data: LogWorkRequest) =>
    apiClient.post<WorkLogResponse>("/api/work-logs", data),
};