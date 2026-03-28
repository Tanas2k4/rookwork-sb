import { useState, useEffect, useContext } from "react";
import { ProjectContext } from "../context/ProjectContext";
import { issueApi } from "../api/services/issueApi";
import { activityApi } from "../api/services/activityApi";
import type { IssueResponse } from "../api/contracts/issue";
import type { ActivityResponse } from "../api/contracts/activity";

//  Helpers 

export function getDaysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export function fmtDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

//  Derived types 

export interface OverviewIssue extends IssueResponse {
  daysLeft: number;
  deadlineLabel: string;
}

export interface MilestoneItem {
  id: string;
  name: string;
  deadline: string;
  status: "to_do" | "in_progress" | "done";
  progress: number;
  taskCount: number;
}

export interface WorkloadItem {
  id: string;         // assignedTo.id (UUID)
  name: string;
  picture: string;
  email: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  actorName: string;
  actorPicture: string | null;
  action: string;
  time: string;
}

export interface OverviewData {
  // Stats
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  overdueCount: number;
  dueSoonCount: number;
  overallProgress: number;

  // Timeline
  timelineTasks: OverviewIssue[];

  // Attention (top 5)
  attentionTasks: OverviewIssue[];

  // Milestones (epics)
  milestones: MilestoneItem[];

  // Workload
  workload: WorkloadItem[];
  maxWorkload: number;

  // Recent activity
  activities: ActivityItem[];
}

function apiStatusToUI(s: IssueResponse["status"]): "to_do" | "in_progress" | "done" {
  if (s === "IN_PROGRESS") return "in_progress";
  if (s === "DONE") return "done";
  return "to_do";
}

function computeProgress(issue: IssueResponse): number {
  if (issue.status === "DONE") return 100;
  if (issue.status === "IN_PROGRESS") return 40;
  return 0;
}

function actionLabel(a: ActivityResponse): string {
  const type = a.actionType?.toLowerCase() ?? "";
  const entity = a.entityName ?? "";
  if (type.includes("create")) return `created issue "${entity}"`;
  if (type.includes("update")) return `updated "${entity}"`;
  if (type.includes("delete")) return `deleted "${entity}"`;
  if (type.includes("comment")) return `commented on "${entity}"`;
  if (type.includes("status")) return `changed status of "${entity}"`;
  if (type.includes("assign")) return `assigned "${entity}"`;
  return `${a.actionType ?? "acted on"} "${entity}"`;
}

function deriveOverview(issues: IssueResponse[], activities: ActivityResponse[]): OverviewData {
  const total = issues.length;
  const done = issues.filter((i) => i.status === "DONE").length;
  const inProgress  = issues.filter((i) => i.status === "IN_PROGRESS").length; 

  const overdue = issues.filter(
    (i) => i.deadline && getDaysLeft(i.deadline) < 0 && i.status !== "DONE",
  ).length;
  const dueSoon = issues.filter(
    (i) =>
      i.deadline &&
      getDaysLeft(i.deadline) >= 0 &&
      getDaysLeft(i.deadline) <= 7 &&
      i.status !== "DONE",
  ).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  // Timeline — issues with deadline, sorted by daysLeft
  const timelineTasks: OverviewIssue[] = issues
    .filter((i) => i.deadline)
    .map((i) => ({
      ...i,
      daysLeft: getDaysLeft(i.deadline!),
      deadlineLabel: fmtDeadline(i.deadline!),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Attention — overdue first, then due soon, top 5
  const attentionTasks: OverviewIssue[] = [
    ...issues.filter((i) => i.deadline && getDaysLeft(i.deadline) < 0 && i.status !== "DONE"),
    ...issues.filter((i) => i.deadline && getDaysLeft(i.deadline) >= 0 && i.status !== "DONE"),
  ]
    .slice(0, 5)
    .map((i) => ({
      ...i,
      daysLeft: getDaysLeft(i.deadline!),
      deadlineLabel: fmtDeadline(i.deadline!),
    }));

  // Milestones — use EPICs
  const epics = issues.filter((i) => i.issueType === "EPIC");
  const milestones: MilestoneItem[] = epics.map((epic) => {
    const children = issues.filter((i) => i.parentId === epic.id);
    const all = [epic, ...children];
    const prog = Math.round(all.reduce((s, i) => s + computeProgress(i), 0) / all.length);
    return {
      id: epic.id,
      name: epic.issueName,
      deadline: epic.deadline ? fmtDeadline(epic.deadline) : "No deadline",
      status: apiStatusToUI(epic.status),
      progress: prog,
      taskCount: all.length,
    };
  });

  // Workload — count per assignee
  const workloadMap = new Map<string, WorkloadItem>();
  issues.forEach((i) => {
    if (!i.assignedTo) return;
    const { id, profileName, picture } = i.assignedTo;
    if (!workloadMap.has(id)) {
      workloadMap.set(id, {
        id,
        name: profileName,
        picture:
          picture ??
          `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=7c3aed&color=fff`,
        email: "",
        count: 0,
      });
    }
    workloadMap.get(id)!.count += 1;
  });
  const workload = Array.from(workloadMap.values()).sort((a, b) => b.count - a.count);
  const maxWorkload = Math.max(...workload.map((w) => w.count), 1);

  // Recent activity
  const activityItems: ActivityItem[] = activities.map((a) => ({
    id: a.id,
    actorName: a.actorName,
    actorPicture:
      a.actorPicture ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(a.actorName)}&background=7c3aed&color=fff`,
    action: actionLabel(a),
    time: fmtRelative(a.createdAt),
  }));

  return {
    totalTasks: total,
    doneTasks: done,
    inProgressTasks: inProgress, 
    overdueCount: overdue,
    dueSoonCount: dueSoon,
    overallProgress: progress,
    timelineTasks,
    attentionTasks,
    milestones,
    workload,
    maxWorkload,
    activities: activityItems,
  };
}

//  Hook 

export interface UseOverviewReturn {
  data: OverviewData | null;
  error: string | null;
  reload: () => void;
}

const EMPTY: OverviewData = {
  totalTasks: 0, doneTasks: 0,inProgressTasks: 0, overdueCount: 0, dueSoonCount: 0, overallProgress: 0,
  timelineTasks: [], attentionTasks: [], milestones: [],
  workload: [], maxWorkload: 1, activities: [],
};

export function useOverview(): UseOverviewReturn {
  const { projectId } = useContext(ProjectContext);
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    Promise.all([
      issueApi.getAll(projectId),
      activityApi.getByProject(projectId, 20),
    ])
      .then(([issues, activities]) => {
        if (!cancelled) setData(deriveOverview(issues, activities));
      })
      .catch((err) => {
        console.error("useOverview: failed to load", err);
        if (!cancelled) setError("Failed to load overview");
      });

    return () => { cancelled = true; };
  }, [projectId, tick]);

  const reload = () => setTick((n) => n + 1);

  return { data: data ?? EMPTY, error, reload };
}