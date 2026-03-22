import { createContext } from "react";
import type { ProjectResponse } from "../api/contracts";
import type { UserSummary } from "../api/contracts/issue";

export interface ProjectContextValue {
  projectId: string | null;
  projectKey: string | null;
  project: ProjectResponse | null;
  members: UserSummary[];
  loading: boolean;
  refresh: () => void;
  reloadIssues: () => void;      
  setReloadIssues: (fn: () => void) => void; 
}

export const ProjectContext = createContext<ProjectContextValue>({
  projectId: null,
  projectKey: null,
  project: null,
  members: [],
  loading: false,
  refresh: () => {},
  reloadIssues: () => {},
  setReloadIssues: () => {},
});