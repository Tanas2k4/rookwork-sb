import { apiClient } from "../apiClient";
import type { NotificationResponse } from "../contracts/notification";

export const notificationApi = {
  getAll: () =>
    apiClient.get<NotificationResponse[]>("/api/notifications"),

  getUnread: () =>
    apiClient.get<NotificationResponse[]>("/api/notifications/unread"),

  countUnread: () =>
    apiClient.get<{ count: number }>("/api/notifications/unread/count"),

  markAsRead: (notificationId: string) =>
    apiClient.put<void>(`/api/notifications/${notificationId}/read`, {}),

  markAllAsRead: () =>
    apiClient.put<void>("/api/notifications/read-all", {}),

  delete: (notificationId: string) =>
    apiClient.delete<void>(`/api/notifications/${notificationId}`),
};