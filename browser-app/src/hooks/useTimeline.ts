import { useState, useEffect, useCallback } from "react";
import { issueApi } from "../api/services/issueApi";
import { taskToGantt } from "../project/timeline/timelineUtils";
import type { GanttTask } from "../project/timeline/timelineUtils";
import type { IssueResponse } from "../api/contracts/issue";
import type { Task, TaskType, Status } from "../types/project";

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function apiStatusToUI(s: IssueResponse["status"]): Status {
  if (!s) return "to_do";
  const map: Record<NonNullable<IssueResponse["status"]>, Status> = {
    TO_DO: "to_do",
    IN_PROGRESS: "in_progress",
    DONE: "done",
  };
  return map[s];
}

function apiTypeToUI(t: IssueResponse["issueType"]): TaskType {
  return t.toLowerCase() as TaskType;
}

// Duration fallback per type (days) — mirrors timelineUtils inferStart logic
const TYPE_DURATION: Record<IssueResponse["issueType"], number> = {
  TASK: 7,
  STORY: 14,
  EPIC: 28,
};

function addDaysToDate(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function issueToMinimalTask(issue: IssueResponse): Task {
  return {
    id: 0,
    title: issue.issueName,
    type: apiTypeToUI(issue.issueType),
    status: apiStatusToUI(issue.status),
    priority: "medium",
    deadline: issue.deadline ? issue.deadline.split("T")[0] : null,
    assigned_to: issue.assignedTo
      ? {
          id: 0,
          email: "",
          display_name: issue.assignedTo.profileName,
          avt:
            issue.assignedTo.picture ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              issue.assignedTo.profileName,
            )}&background=7c3aed&color=fff`,
        }
      : null,
    subtasks: [],
    parentId: null,
    childIds: [],
  };
}

function issueToGantt(issue: IssueResponse): GanttTask {
  const minimalTask = issueToMinimalTask(issue);
  const gantt = taskToGantt(minimalTask);

  const start = new Date(issue.createdAt);

  // has deadline → use it as end
  // no deadline  → start + default duration per type (task=7d, story=14d, epic=28d)
  const end = issue.deadline
    ? new Date(issue.deadline)
    : addDaysToDate(start, TYPE_DURATION[issue.issueType]);

  return {
    ...gantt,
    id: issue.id,
    start,
    end,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseTimelineReturn {
  ganttTasks: GanttTask[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useTimeline(projectId: string | null): UseTimelineReturn {
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const issues = await issueApi.getAll(projectId);
      setGanttTasks(issues.map(issueToGantt));
    } catch (err) {
      console.error("useTimeline: failed to load issues", err);
      setError("Failed to load timeline data");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ganttTasks, loading, error, reload: load };
}