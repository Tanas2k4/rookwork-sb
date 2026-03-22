import type { DbComment, DbIssue, DbSubtask, DbUser, UUID } from "../api/contracts";
import type { Comment, Task, TaskPriority, TaskStatus, TaskType, User } from "../types/project";

function toDateOnly(isoTs: string | null): string | null {
  if (!isoTs) return null;
  // "timestamp without time zone" usually comes as ISO; UI expects YYYY-MM-DD in many places.
  const d = new Date(isoTs);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function toDisplayTime(isoTs: string | null): string {
  if (!isoTs) return "";
  const d = new Date(isoTs);
  if (Number.isNaN(d.getTime())) return "";
  // Keep existing UI look: "dd/MM/yyyy HH:mm"
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mapIssueType(t: string): TaskType {
  if (t === "epic" || t === "story" || t === "task") return t;
  return "task";
}

function mapPriority(p: string | null): TaskPriority {
  if (p === "low" || p === "medium" || p === "high" || p === "urgent") return p;
  return "medium";
}

function mapStatus(s: string | null): TaskStatus {
  if (s === "to_do" || s === "in_progress" || s === "done") return s;
  return "to_do";
}

// UI currently uses numeric ids. We keep UI stable by generating a deterministic numeric id per uuid.
export class IdMapper {
  private seq = 0;
  private map = new Map<UUID, number>();

  num(id: UUID): number {
    const hit = this.map.get(id);
    if (hit) return hit;
    const next = ++this.seq;
    this.map.set(id, next);
    return next;
  }
}

export function adaptUser(u: DbUser, ids: IdMapper): User {
  return {
    id: ids.num(u.id),
    email: u.email,
    display_name: u.profile_name ?? u.email.split("@")[0],
    avt: u.picture ?? "https://i.pravatar.cc/150?img=1",
  };
}

export function adaptTask(
  issue: DbIssue,
  usersById: Map<UUID, User>,
  ids: IdMapper,
  subtasksByIssueId: Map<UUID, DbSubtask[]>,
  childrenByParentId: Map<UUID, UUID[]>,
): Task {
  const assigned = issue.assigned_to ? usersById.get(issue.assigned_to) ?? null : null;
  const subs = (subtasksByIssueId.get(issue.id) ?? []).map((s) => ({
    id: ids.num(s.id),
    title: s.subtask_name ?? "Untitled",
    done: Boolean(s.is_done),
  }));

  return {
    id: ids.num(issue.id),
    title: issue.issue_name,
    description: issue.description ?? "",
    type: mapIssueType(issue.issue_type),
    priority: mapPriority(issue.priority),
    assigned_to: assigned,
    deadline: toDateOnly(issue.deadline),
    status: mapStatus(issue.status),
    subtasks: subs,
    parentId: issue.parent_id ? ids.num(issue.parent_id) : null,
    childIds: (childrenByParentId.get(issue.id) ?? []).map((cid) => ids.num(cid)),
  };
}

export function adaptComment(c: DbComment, ids: IdMapper, issueIdToTaskId: Map<UUID, number>): Comment {
  return {
    id: ids.num(c.id),
    taskId: issueIdToTaskId.get(c.issue_id) ?? 0,
    userId: ids.num(c.user_id),
    content: c.content,
    createdAt: toDisplayTime(c.created_at),
    parentId: c.parent_comment_id ? ids.num(c.parent_comment_id) : null,
  };
}

