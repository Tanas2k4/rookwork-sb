export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  issueId?: string;
  issueName?: string;
  invitationId?: string;       
  sender?: {
    id?: string;
    profileName: string;
    picture?: string;
  };
}