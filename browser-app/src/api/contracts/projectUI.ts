import type { ProjectResponse } from "./project";

export interface ProjectUI extends ProjectResponse {
  progress: number;
  accentColor: string;
  daysLeft: number;
}

const ACCENT_COLORS = ["#7c3aed", "#f59e0b", "#f43f5e", "#06b6d4", "#10b981"];

export function toProjectUI(p: ProjectResponse, index: number): ProjectUI {
  const deadline = p.updatedAt ? new Date(p.updatedAt) : new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000));

  const progress = p.totalIssues > 0
    ? Math.round((p.doneIssues / p.totalIssues) * 100)
    : 0;

  return {
    ...p,
    progress,
    accentColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
    daysLeft,
  };
}