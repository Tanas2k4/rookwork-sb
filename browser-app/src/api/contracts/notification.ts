export interface NotificationSender {
  id: string;
  profileName: string;
  picture: string | null;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  issueId: string;
  issueName: string;
  isRead: boolean;
  read: boolean;
  sender: NotificationSender | null;
  createdAt: string;
}