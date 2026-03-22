import type { Task } from "../types/project";
import { MOCK_TASKS } from "./board";

export interface Milestone {
  id: number;
  name: string;
  deadline: string;
  status: Task["status"];
  progress: number;
  taskCount: number;
}

export interface ActivityItem {
  id: number;
  userId: number;
  action: string;
  time: string;
}

export const TODAY = new Date("2026-02-24");

export function getDaysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - TODAY.getTime()) / 86400000);
}

export function fmtDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const totalTasks = MOCK_TASKS.length;
export const doneTasks = MOCK_TASKS.filter((t) => t.status === "done").length;
export const overdueCount = MOCK_TASKS.filter(
  (t) => t.deadline && getDaysLeft(t.deadline) < 0 && t.status !== "done",
).length;
export const dueSoonCount = MOCK_TASKS.filter(
  (t) =>
    t.deadline &&
    getDaysLeft(t.deadline) >= 0 &&
    getDaysLeft(t.deadline) <= 7 &&
    t.status !== "done",
).length;
export const overallProgress = Math.round((doneTasks / totalTasks) * 100);

export const timelineTasks = [...MOCK_TASKS]
  .filter((t) => t.deadline)
  .map((t) => ({
    ...t,
    daysLeft: getDaysLeft(t.deadline!),
    deadlineLabel: fmtDeadline(t.deadline!),
  }))
  .sort((a, b) => a.daysLeft - b.daysLeft);

export const attentionTasks = [
  ...MOCK_TASKS.filter(
    (t) => t.deadline && getDaysLeft(t.deadline) < 0 && t.status !== "done",
  ),
  ...MOCK_TASKS.filter(
    (t) => t.deadline && getDaysLeft(t.deadline) >= 0 && t.status !== "done",
  ),
]
  .slice(0, 5)
  .map((t) => ({
    ...t,
    daysLeft: getDaysLeft(t.deadline!),
    deadlineLabel: fmtDeadline(t.deadline!),
  }));

export const workloadMap: Record<number, number> = {};
MOCK_TASKS.forEach((t) => {
  if (t.assigned_to)
    workloadMap[t.assigned_to.id] = (workloadMap[t.assigned_to.id] || 0) + 1;
});
export const maxWorkload = Math.max(...Object.values(workloadMap), 1);

function computeProgress(taskId: number): number {
  const task = MOCK_TASKS.find((t) => t.id === taskId);
  if (!task) return 0;
  if (task.status === "done") return 100;
  if (task.subtasks.length === 0) return task.status === "in_progress" ? 50 : 0;
  const done = task.subtasks.filter((s) => s.done).length;
  return Math.round((done / task.subtasks.length) * 100);
}

export const MILESTONES: Milestone[] = MOCK_TASKS.map((task) => {
  const taskCount = 1 + (task.childIds?.length ?? 0);
  const allIds = [task.id, ...(task.childIds ?? [])];
  const totalProgress =
    allIds.reduce((sum, id) => sum + computeProgress(id), 0) / allIds.length;
  return {
    id: task.id,
    name: task.title,
    deadline: task.deadline
      ? new Date(task.deadline).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "No deadline",
    status: task.status,
    progress: Math.round(totalProgress),
    taskCount,
  };
});

export const ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    userId: 1,
    action: 'completed task "Design mobile app wireframes"',
    time: "5 min ago",
  },
  {
    id: 2,
    userId: 2,
    action: 'created task "Review API docs"',
    time: "23 min ago",
  },
  {
    id: 3,
    userId: 3,
    action: 'moved "Create database schema" → Done',
    time: "1 hour ago",
  },
  {
    id: 4,
    userId: 4,
    action: 'commented on "Mobile App Dev Sprint"',
    time: "2 hours ago",
  },
  {
    id: 5,
    userId: 5,
    action: 'uploaded "API_Spec_v2.pdf"',
    time: "4 hours ago",
  },
  {
    id: 6,
    userId: 1,
    action: 'assigned "Write unit tests" to team',
    time: "Yesterday",
  },
];

