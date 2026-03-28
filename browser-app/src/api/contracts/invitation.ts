export interface InvitationResponse {
  id: string;
  projectId: string;
  projectName: string;
  invitedById: string;
  invitedByName: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;    
}