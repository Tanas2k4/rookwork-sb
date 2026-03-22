// // Backend-shaped entities (uuid, snake_case) so that mapping to real APIs is 1:1.

// export type UUID = string;

// export interface DbUser {
//   id: UUID;
//   email: string;
//   profile_name: string | null;
//   picture: string | null;
//   is_active: boolean | null;
//   is_verified: boolean | null;
//   created_at: string | null;
//   updated_at: string | null;
// }

// export interface DbProject {
//   id: UUID;
//   project_name: string;
//   is_private: boolean | null;
//   created_at: string | null;
//   updated_at: string | null;
// }

// export interface DbProjectMember {
//   user_id: UUID;
//   project_id: UUID;
//   role: string | null;
//   created_at: string | null;
//   updated_at: string | null;
// }

// export interface DbIssue {
//   id: UUID;
//   issue_name: string;
//   description: string | null;
//   issue_type: string; // backend uses varchar; UI will map to "task" | "story" | "epic"
//   priority: string | null;
//   status: string | null;
//   parent_id: UUID | null;
//   project_id: UUID;
//   deadline: string | null; // timestamp without time zone (ISO string)
//   created_at: string | null;
//   updated_at: string | null;
//   assigned_to: UUID | null;
//   created_by: UUID | null;
// }

// export interface DbSubtask {
//   id: UUID;
//   subtask_name: string | null;
//   subtask_description: string | null;
//   is_done: boolean | null;
//   issue_id: UUID;
//   created_at: string | null;
//   updated_at: string | null;
// }

// export interface DbComment {
//   id: UUID;
//   content: string;
//   user_id: UUID;
//   parent_comment_id: UUID | null;
//   created_at: string | null;
//   updated_at: string | null;
//   issue_id: UUID;
// }

// export interface DbActivity {
//   id: UUID;
//   project_id: UUID;
//   actor_id: UUID;
//   action: string;
//   entity_type: string;
//   entity_id: UUID;
//   entity_name: string | null;
//   metadata: Record<string, unknown> | null;
//   created_at: string | null;
// }

// export interface DbEvent {
//   id: UUID;
//   event_name: string;
//   event_description: string | null;
//   deadline: string | null;
//   user_id: UUID | null;
//   project_id: UUID | null;
//   created_at: string | null;
//   updated_at: string | null;
// }

// export interface DbFile {
//   id: UUID;
//   original_name: string | null;
//   stored_name: string | null;
//   mime_type: string | null;
//   size_bytes: number | null;
//   storage_path: string | null;
//   uploaded_by: string | null;
//   created_at: string | null;
//   updated_at: string | null;
//   user_id: UUID;
// }

// export interface DbNotification {
//   id: UUID;
//   user_id: UUID;
//   title: string;
//   message: string | null;
//   is_read: boolean | null;
//   created_at: string | null;
//   updated_at: string | null;
//   issue_id: UUID;
// }

// export interface DbInvitation {
//   id: UUID;
//   project_id: UUID;
//   invited_by: UUID;
//   invited_user: UUID;
//   status: string;
//   created_at: string | null;
//   updated_at: string | null;
// }

