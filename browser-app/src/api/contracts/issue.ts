export type IssueType = "EPIC" | "STORY" | "TASK";
export type PriorityType = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Status = "TO_DO" | "IN_PROGRESS" | "DONE";

export interface UserSummary {
  id: string;
  profileName: string;
  picture: string | null;
}

export interface CreateIssueRequest {
  issueName: string;
  issueType: IssueType;
  priority: PriorityType;
  description?: string;
  deadline?: string; // ISO string
  status: Status;
}

export interface UpdateIssueRequest {
  issueName?: string;
  description?: string;
  priority?: PriorityType;
  deadline?: string;
  assignedToId?: string;
  status?: Status;
  parentId?: string;
}

export interface IssueResponse {
  id: string;
  issueName: string;
  description: string | null;
  issueType: IssueType;
  priority: PriorityType | null;
  status: Status | null;
  parentId: string | null;
  projectId: string;
  assignedTo: UserSummary | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}
