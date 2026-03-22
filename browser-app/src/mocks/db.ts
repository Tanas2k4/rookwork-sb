import type {
  DbActivity,
  DbComment,
  DbIssue,
  DbProject,
  DbProjectMember,
  DbSubtask,
  DbUser,
  UUID,
} from "../api/contracts";

function uuid(): UUID {
  // Browser + modern node.
  if (typeof globalThis.crypto?.randomUUID === "function")
    return globalThis.crypto.randomUUID();
  // Fallback: not cryptographically strong (ok for mocks).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function iso(dt: Date): string {
  return dt.toISOString();
}

// "Now" fixed to keep demo stable across reloads.
const NOW = new Date("2026-03-08T09:10:00.000Z");

export interface MockDb {
  users: DbUser[];
  projects: DbProject[];
  project_members: DbProjectMember[];
  issues: DbIssue[];
  subtasks: DbSubtask[];
  comments: DbComment[];
  activities: DbActivity[];
}

export const mockDb: MockDb = (() => {
  // Users
  const u1: DbUser = {
    id: uuid(),
    email: "bongbo355@gmail.com",
    profile_name: "Trần Tấn",
    picture: "https://i.pravatar.cc/150?img=1",
    is_active: true,
    is_verified: true,
    created_at: iso(new Date("2026-02-01T00:00:00.000Z")),
    updated_at: iso(new Date("2026-03-01T00:00:00.000Z")),
  };
  const u2: DbUser = {
    id: uuid(),
    email: "khar34@gmail.com",
    profile_name: "Phạm Hoàng Tuấn Kha",
    picture: "https://i.pravatar.cc/150?img=2",
    is_active: true,
    is_verified: true,
    created_at: iso(new Date("2026-02-02T00:00:00.000Z")),
    updated_at: iso(new Date("2026-03-01T00:00:00.000Z")),
  };
  const u3: DbUser = {
    id: uuid(),
    email: "nak@gmail.com",
    profile_name: "Nguyễn An Khang",
    picture: "https://i.pravatar.cc/150?img=3",
    is_active: true,
    is_verified: false,
    created_at: iso(new Date("2026-02-03T00:00:00.000Z")),
    updated_at: iso(new Date("2026-03-01T00:00:00.000Z")),
  };
  const u4: DbUser = {
    id: uuid(),
    email: "PhamC@gmail.com",
    profile_name: "Phạm Minh C",
    picture: "https://i.pravatar.cc/150?img=4",
    is_active: true,
    is_verified: true,
    created_at: iso(new Date("2026-02-04T00:00:00.000Z")),
    updated_at: iso(new Date("2026-03-01T00:00:00.000Z")),
  };
  const u5: DbUser = {
    id: uuid(),
    email: "HoangD@gmail.com",
    profile_name: "Hoàng Thị D",
    picture: "https://i.pravatar.cc/150?img=5",
    is_active: true,
    is_verified: true,
    created_at: iso(new Date("2026-02-05T00:00:00.000Z")),
    updated_at: iso(new Date("2026-03-01T00:00:00.000Z")),
  };

  // Projects
  const p1: DbProject = {
    id: uuid(),
    project_name: "Mobile Application",
    is_private: false,
    created_at: iso(new Date("2026-02-20T00:00:00.000Z")),
    updated_at: iso(new Date("2026-03-05T00:00:00.000Z")),
  };

  // Members
  const project_members: DbProjectMember[] = [
    { user_id: u1.id, project_id: p1.id, role: "owner", created_at: null, updated_at: null },
    { user_id: u2.id, project_id: p1.id, role: "member", created_at: null, updated_at: null },
    { user_id: u3.id, project_id: p1.id, role: "member", created_at: null, updated_at: null },
    { user_id: u4.id, project_id: p1.id, role: "member", created_at: null, updated_at: null },
    { user_id: u5.id, project_id: p1.id, role: "member", created_at: null, updated_at: null },
  ];

  // Issues (map to current UI task/story/epic)
  const epic: DbIssue = {
    id: uuid(),
    issue_name: "Mobile App Dev Sprint",
    description: "Complete the development of mobile app features this sprint",
    issue_type: "epic",
    priority: "urgent",
    status: "in_progress",
    parent_id: null,
    project_id: p1.id,
    deadline: iso(new Date("2026-03-05T00:00:00.000Z")),
    created_at: iso(new Date("2026-02-24T00:00:00.000Z")),
    updated_at: iso(NOW),
    assigned_to: u1.id,
    created_by: u1.id,
  };

  const story: DbIssue = {
    id: uuid(),
    issue_name: "Develop login functionality",
    description: "Implement user authentication and login features",
    issue_type: "story",
    priority: "medium",
    status: "to_do",
    parent_id: epic.id,
    project_id: p1.id,
    deadline: iso(new Date("2026-03-01T00:00:00.000Z")),
    created_at: iso(new Date("2026-02-24T00:00:00.000Z")),
    updated_at: iso(NOW),
    assigned_to: u2.id,
    created_by: u1.id,
  };

  const task1: DbIssue = {
    id: uuid(),
    issue_name: "Design mobile app wireframes",
    description: "Create wireframes for the new mobile app design",
    issue_type: "task",
    priority: "high",
    status: "in_progress",
    parent_id: story.id,
    project_id: p1.id,
    deadline: iso(new Date("2026-02-25T00:00:00.000Z")),
    created_at: iso(new Date("2026-02-24T00:00:00.000Z")),
    updated_at: iso(NOW),
    assigned_to: u1.id,
    created_by: u1.id,
  };

  const task2: DbIssue = {
    id: uuid(),
    issue_name: "Create database schema",
    description: "Design the database schema for the project",
    issue_type: "task",
    priority: "low",
    status: "done",
    parent_id: null,
    project_id: p1.id,
    deadline: iso(new Date("2026-02-27T00:00:00.000Z")),
    created_at: iso(new Date("2026-02-22T00:00:00.000Z")),
    updated_at: iso(new Date("2026-02-27T08:00:00.000Z")),
    assigned_to: u3.id,
    created_by: u1.id,
  };

  const task3: DbIssue = {
    id: uuid(),
    issue_name: "Write unit tests",
    description: "Write unit tests for the new features implemented",
    issue_type: "task",
    priority: "medium",
    status: "to_do",
    parent_id: null,
    project_id: p1.id,
    deadline: iso(new Date("2026-03-08T00:00:00.000Z")),
    created_at: iso(new Date("2026-03-01T00:00:00.000Z")),
    updated_at: iso(NOW),
    assigned_to: null,
    created_by: u1.id,
  };

  const issues: DbIssue[] = [task1, story, task2, epic, task3];

  // Subtasks
  const subtasks: DbSubtask[] = [
    {
      id: uuid(),
      issue_id: task1.id,
      subtask_name: "Login screen",
      subtask_description: null,
      is_done: true,
      created_at: null,
      updated_at: null,
    },
    {
      id: uuid(),
      issue_id: task1.id,
      subtask_name: "Dashboard screen",
      subtask_description: null,
      is_done: false,
      created_at: null,
      updated_at: null,
    },
    {
      id: uuid(),
      issue_id: task1.id,
      subtask_name: "Profile screen",
      subtask_description: null,
      is_done: false,
      created_at: null,
      updated_at: null,
    },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: uuid(),
      issue_id: epic.id,
      subtask_name: `Sprint task ${i + 1}`,
      subtask_description: null,
      is_done: i < 3,
      created_at: null,
      updated_at: null,
    })),
    {
      id: uuid(),
      issue_id: task3.id,
      subtask_name: "Auth tests",
      subtask_description: null,
      is_done: false,
      created_at: null,
      updated_at: null,
    },
    {
      id: uuid(),
      issue_id: task3.id,
      subtask_name: "API tests",
      subtask_description: null,
      is_done: false,
      created_at: null,
      updated_at: null,
    },
  ];

  // Comments (issue_id, parent_comment_id)
  const c1: DbComment = {
    id: uuid(),
    issue_id: task1.id,
    user_id: u1.id,
    content: "Đã xong phần wireframe màn login",
    parent_comment_id: null,
    created_at: iso(new Date("2026-02-25T23:59:00.000Z")),
    updated_at: null,
  };
  const c2: DbComment = {
    id: uuid(),
    issue_id: task1.id,
    user_id: u2.id,
    content: "Cần review lại flow onboarding",
    parent_comment_id: null,
    created_at: iso(new Date("2026-02-26T09:10:00.000Z")),
    updated_at: null,
  };

  // Activities
  const activities: DbActivity[] = [
    {
      id: uuid(),
      project_id: p1.id,
      actor_id: u1.id,
      action: "completed",
      entity_type: "issue",
      entity_id: task1.id,
      entity_name: task1.issue_name,
      metadata: { status: "done" },
      created_at: iso(new Date("2026-03-08T08:55:00.000Z")),
    },
    {
      id: uuid(),
      project_id: p1.id,
      actor_id: u2.id,
      action: "created",
      entity_type: "issue",
      entity_id: uuid(),
      entity_name: "Review API docs",
      metadata: { issue_type: "task" },
      created_at: iso(new Date("2026-03-08T08:35:00.000Z")),
    },
  ];

  return {
    users: [u1, u2, u3, u4, u5],
    projects: [p1],
    project_members,
    issues,
    subtasks,
    comments: [c1, c2],
    activities,
  };
})();

