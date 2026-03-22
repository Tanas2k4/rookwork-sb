export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  issueId: string;
  issueName: string;
  isRead: boolean; 
  read: boolean;    
  createdAt: string;
}