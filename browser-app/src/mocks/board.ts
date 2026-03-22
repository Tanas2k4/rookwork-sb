import type { Comment, Task, User } from "../types/project";
import { mockDb } from "./db";
import { adaptComment, adaptTask, adaptUser, IdMapper } from "./adapters";

const ids = new IdMapper();

// Users (DbUser -> UI User)
export const MOCK_USERS: User[] = mockDb.users.map((u) => adaptUser(u, ids));
export const CURRENT_USER = MOCK_USERS[0];

// Helper indexes
const usersByUuid = new Map(mockDb.users.map((u) => [u.id, adaptUser(u, ids)]));
const subtasksByIssueId = new Map<string, typeof mockDb.subtasks>();
mockDb.subtasks.forEach((s) => {
  const arr = subtasksByIssueId.get(s.issue_id) ?? [];
  arr.push(s);
  subtasksByIssueId.set(s.issue_id, arr);
});

const childrenByParentId = new Map<string, string[]>();
mockDb.issues.forEach((i) => {
  if (!i.parent_id) return;
  const arr = childrenByParentId.get(i.parent_id) ?? [];
  arr.push(i.id);
  childrenByParentId.set(i.parent_id, arr);
});

// Issues (DbIssue -> UI Task)
export const MOCK_TASKS: Task[] = mockDb.issues.map((issue) =>
  adaptTask(issue, usersByUuid, ids, subtasksByIssueId, childrenByParentId),
);

// Comments (DbComment -> UI Comment)
const issueIdToTaskId = new Map<string, number>();
mockDb.issues.forEach((i) => issueIdToTaskId.set(i.id, ids.num(i.id)));

export const MOCK_COMMENTS: Comment[] = mockDb.comments.map((c) =>
  adaptComment(c, ids, issueIdToTaskId),
);

