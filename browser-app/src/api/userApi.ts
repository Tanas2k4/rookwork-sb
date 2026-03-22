import { apiClient } from "./apiClient";
import type { UserSummary } from "./contracts/issue";

export const userApi = {
  getMe: () => apiClient.get<UserSummary>("/api/users/me"),
};
