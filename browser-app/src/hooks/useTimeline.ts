import { useState, useEffect } from "react";
import { issueApi } from "../api/services/issueApi";
import { taskToGantt } from "../project/timeline/timelineUtils";
import type { GanttTask } from "../project/timeline/timelineUtils";
import type { IssueResponse } from "../api/contracts/issue";
import type { Task, TaskType, Status } from "../types/project";

//  Mapping helpers 

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
  const end = issue.deadline
    ? new Date(issue.deadline)
    : addDaysToDate(start, TYPE_DURATION[issue.issueType]);
  return { ...gantt, id: issue.id, start, end };
}

//  Hook 

export interface UseTimelineReturn {
  ganttTasks: GanttTask[];
  error: string | null;
  reload: () => void;
}

export function useTimeline(projectId: string | null): UseTimelineReturn {
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    issueApi
      .getAll(projectId)
      .then((issues) => {
        if (!cancelled) setGanttTasks(issues.map(issueToGantt));
      })
      .catch((err) => {
        console.error("useTimeline: failed to load issues", err);
        if (!cancelled) setError("Failed to load timeline data");
      });

    return () => { cancelled = true; };
  }, [projectId, tick]);

  const reload = () => setTick((n) => n + 1);

  return { ganttTasks, error, reload };
}