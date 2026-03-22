import type { UserSummary } from "./issue";

export interface CreateProjectRequest {
  projectName: string;
  description?: string;
}

export interface UpdateProjectRequest {
  projectName?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface ProjectResponse {
  id: string;
  projectName: string;
  description: string | null;
  isPrivate: boolean;
  ownerName: string;
  members: UserSummary[];
  createdAt: string;
  updatedAt: string;
}
