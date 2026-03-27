import { useState, useEffect, useCallback } from "react";
import type { CommentResponse } from "../../../api/contracts/comment";
import { commentApi } from "../../../api/services/commentApi";
import { apiClient } from "../../../api/apiClient";
import { useProject } from "../../../hooks/useProject";
import { useWebSocket, type WsCommentPayload } from "../../../hooks/useWebSocket";
import { tokenStorage } from "../../../api/tokenStorage";

interface ActivityResponse {
  id: string;
  actorName: string;
  actorPicture: string | null;
  actionType: string;
  entityType: string;
  entityId: string;
  entityName: string;
  metadata: string | null;
  createdAt: string;
}

//  Helpers 

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

function avatarUrl(name: string, pic: string | null | undefined): string {
  return pic ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`;
}

function actionLabel(a: ActivityResponse): string {
  const meta = a.metadata
    ? (() => { try { return JSON.parse(a.metadata); } catch { return {}; } })()
    : {};
  switch (a.actionType) {
    case "CREATED":   return `created issue "${a.entityName}"`;
    case "COMPLETED": return `completed issue "${a.entityName}"`;
    case "MOVED":     return `moved "${a.entityName}" from ${meta.from ?? "?"} to ${meta.to ?? "?"}`;
    case "ASSIGNED":  return `assigned "${a.entityName}" to ${meta.assigned_to_name ?? "someone"}`;
    case "UPDATED":   return `updated ${meta.field ?? "field"} of "${a.entityName}"`;
    case "COMMENTED": return `commented on "${a.entityName}"`;
    case "DELETED":   return `deleted "${a.entityName}"`;
    default:          return `${a.actionType.toLowerCase()} "${a.entityName}"`;
  }
}

//  Comment Item 

function CommentItem({
  comment, depth = 0, currentUserId, onEdit, onDelete, onReply,
}: {
  comment: CommentResponse;
  depth?: number;
  currentUserId: string | null;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyValue, setReplyValue] = useState("");

  const isOwn = comment.user?.id === currentUserId;
  const isReply = depth > 0;

  return (
    <div>
      <div className="flex gap-2.5">
        <img
          src={avatarUrl(comment.user?.profileName ?? "?", comment.user?.picture)}
          className={`rounded-full shrink-0 mt-0.5 ${isReply ? "w-5 h-5" : "w-7 h-7"}`}
          alt=""
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className={`font-medium text-gray-800 ${isReply ? "text-[11px]" : "text-sm"}`}>
              {comment.user?.profileName ?? "Unknown"}
            </span>
            <span className={`text-gray-400 ${isReply ? "text-[10px]" : "text-xs"}`}>
              {formatDateTime(comment.createdAt)}
            </span>
          </div>

          {editingId === comment.id ? (
            <div className="space-y-1.5">
              <textarea
                autoFocus value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={2}
                className={`w-full text-gray-700 border border-purple-300 rounded-md p-2 resize-none outline-none bg-white ${isReply ? "text-xs" : "text-sm"}`}
              />
              <div className="flex gap-2">
                <button onClick={() => { onEdit(comment.id, editValue); setEditingId(null); }}
                  className="text-xs bg-purple-800 text-white rounded px-2.5 py-1 hover:bg-purple-700 transition">
                  Save
                </button>
                <button onClick={() => setEditingId(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`bg-white rounded-xl rounded-tl-sm px-3 py-1 ${isReply ? "text-xs" : "text-sm"} text-gray-700 break-words leading-relaxed`}>
                {comment.content}
              </div>
              <div className="flex gap-3 mt-1 items-center">
                {depth === 0 && (
                  <button onClick={() => setShowReplyBox((v) => !v)}
                    className="text-[11px] text-gray-400 hover:text-purple-600 transition">
                    {showReplyBox ? "Cancel reply" : "Reply"}
                  </button>
                )}
                {isOwn && (
                  <>
                    <button onClick={() => { setEditingId(comment.id); setEditValue(comment.content); }}
                      className="text-[11px] text-gray-400 hover:text-gray-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => onDelete(comment.id)}
                      className="text-[11px] text-gray-400 hover:text-red-500 hover:underline">
                      Delete
                    </button>
                  </>
                )}
              </div>

              {showReplyBox && (
                <div className="flex gap-1.5 mt-2">
                  <div className="flex-1 space-y-1.5">
                    <textarea
                      autoFocus
                      placeholder={`Reply to ${comment.user?.profileName}...`}
                      rows={2} value={replyValue}
                      onChange={(e) => setReplyValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (replyValue.trim()) { onReply(comment.id, replyValue); setReplyValue(""); setShowReplyBox(false); }
                        }
                      }}
                      className="w-full text-xs text-gray-700 border border-gray-300 rounded-md p-2 resize-none outline-none bg-white focus:ring-1 focus:ring-purple-400 transition"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setReplyValue(""); setShowReplyBox(false); }}
                        className="text-[11px] text-gray-500 border border-gray-300 rounded-md hover:text-gray-700 px-2 py-0.5">
                        Cancel
                      </button>
                      <button onClick={() => { if (replyValue.trim()) { onReply(comment.id, replyValue); setReplyValue(""); setShowReplyBox(false); } }}
                        className="text-[11px] bg-purple-800 text-white rounded px-2.5 py-0.5 hover:bg-purple-700 transition">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {(comment.replies ?? []).length > 0 && (
            <div className="mt-2 space-y-2.5 pl-2">
              {(comment.replies ?? []).map((reply) => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1}
                  currentUserId={currentUserId} onEdit={onEdit} onDelete={onDelete} onReply={onReply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

//  Activity Log Item ─

function ActivityLogItem({ log }: { log: ActivityResponse }) {
  return (
    <div className="flex gap-2.5 items-start">
      <img src={avatarUrl(log.actorName, log.actorPicture)} className="w-6 h-6 rounded-full shrink-0 mt-0.5" alt="" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-medium text-gray-800">{log.actorName}</span>{" "}{actionLabel(log)}
        </p>
        <span className="text-[10px] text-gray-400">{formatDateTime(log.createdAt)}</span>
      </div>
    </div>
  );
}

//  Main Section 

type Tab = "all" | "comments" | "history";

export function ActivitySection({ issueUuid }: { issueUuid: string }) {
  const { projectId } = useProject();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [newComment, setNewComment] = useState("");
  const [focused, setFocused] = useState(false);

  const currentUserId = tokenStorage.getUserId();

  const loadComments = useCallback(async () => {
    if (!projectId || !issueUuid) return;
    try {
      const data = await commentApi.getByIssue(projectId, issueUuid);
      setComments(data ?? []);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  }, [projectId, issueUuid]);

  useEffect(() => {
    if (!projectId || !issueUuid) return;
    let cancelled = false;

    commentApi.getByIssue(projectId, issueUuid)
      .then((data) => { if (!cancelled) setComments(data ?? []); })
      .catch(console.error);

    apiClient.get<ActivityResponse[]>(`/api/projects/${projectId}/activities?limit=30`)
      .then((data) => { if (!cancelled) setActivities(data ?? []); })
      .catch(console.error);

    return () => { cancelled = true; };
  }, [projectId, issueUuid]);

  // WebSocket — source of truth cho comments, KHÔNG optimistic add
  const handleWsComment = useCallback((payload: WsCommentPayload) => {
    if (payload.type === "NEW_COMMENT" && payload.comment) {
      const c = payload.comment as CommentResponse;
      setComments((prev) => {
        if (prev.some((p) => p.id === c.id)) return prev;
        if (c.parentCommentId) {
          return prev.map((p) =>
            p.id === c.parentCommentId
              ? { ...p, replies: [...(p.replies ?? []), c] }
              : p,
          );
        }
        return [...prev, { ...c, replies: [] }];
      });
    } else if (payload.type === "UPDATED_COMMENT" && payload.comment) {
      const c = payload.comment as CommentResponse;
      setComments((prev) =>
        prev.map((p) => {
          if (p.id === c.id) return { ...c, replies: p.replies };
          return { ...p, replies: (p.replies ?? []).map((r) => r.id === c.id ? c : r) };
        }),
      );
    } else if (payload.type === "DELETED_COMMENT" && payload.commentId) {
      const id = payload.commentId;
      setComments((prev) =>
        prev.filter((p) => p.id !== id).map((p) => ({
          ...p, replies: (p.replies ?? []).filter((r) => r.id !== id),
        })),
      );
    }
  }, []);

  useWebSocket({ projectId, issueId: issueUuid, onComment: handleWsComment });

  // Handlers — KHÔNG add optimistic, để WS xử lý hoặc fallback local
  async function handleSubmit(content: string, parentId?: string) {
    if (!projectId || !content.trim()) return;
    try {
      await commentApi.create(projectId, issueUuid, { content: content.trim(), parentCommentId: parentId });
      // Nếu WS không đến trong 2s thì reload
      setTimeout(() => {
        setComments((prev) => {
          if (prev.length === 0) loadComments();
          return prev;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  }

  async function handleEdit(id: string, content: string) {
    if (!projectId || !content.trim()) return;
    try {
      await commentApi.update(projectId, issueUuid, id, { content });
      setComments((prev) =>
        prev.map((p) => {
          if (p.id === id) return { ...p, content };
          return { ...p, replies: (p.replies ?? []).map((r) => r.id === id ? { ...r, content } : r) };
        }),
      );
    } catch (err) {
      console.error("Failed to edit comment", err);
    }
  }

  async function handleDelete(id: string) {
    if (!projectId) return;
    try {
      await commentApi.delete(projectId, issueUuid, id);
      setComments((prev) =>
        prev.filter((p) => p.id !== id).map((p) => ({
          ...p, replies: (p.replies ?? []).filter((r) => r.id !== id),
        })),
      );
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  }

  const nestedComments = comments.filter((c) => !c.parentCommentId);
  const totalCommentCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "comments", label: `Comments${totalCommentCount ? ` (${totalCommentCount})` : ""}` },
    { key: "history", label: "History" },
  ];

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity</p>

      <div className="flex gap-0 border-b border-gray-200 mb-4">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition ${
              tab === t.key ? "border-purple-600 text-purple-700" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "history" && (
        <div className="flex gap-2.5 mb-4">
          <div className="flex-1 space-y-2">
            <textarea
              placeholder="Add a comment..." rows={focused ? 3 : 1} value={newComment}
              onFocus={() => setFocused(true)}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (newComment.trim()) { handleSubmit(newComment); setNewComment(""); setFocused(false); }
                }
              }}
              className="w-full text-sm text-gray-700 border border-gray-500 rounded-lg p-2.5 resize-none outline-none bg-white focus:border-purple-300 focus:ring-1 focus:ring-purple-400 transition"
            />
            {(focused || newComment.trim()) && (
              <div className="flex justify-end gap-2">
                <button onClick={() => { setNewComment(""); setFocused(false); }}
                  className="text-xs text-gray-700 border border-gray-500 rounded-md hover:bg-gray-100 px-2.5 py-1 transition">
                  Cancel
                </button>
                <button onClick={() => { if (newComment.trim()) { handleSubmit(newComment); setNewComment(""); setFocused(false); } }}
                  className="text-xs bg-purple-800 text-white rounded px-3 py-1 hover:bg-purple-700 transition">
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tab === "all" && (
          <>
            {activities.length === 0 && nestedComments.length === 0 && (
              <p className="text-xs text-gray-300 italic">No activity yet.</p>
            )}
            {activities.map((log) => <ActivityLogItem key={log.id} log={log} />)}
            {activities.length > 0 && nestedComments.length > 0 && <div className="border-t border-gray-100" />}
            {nestedComments.map((c) => (
              <CommentItem key={c.id} comment={c} depth={0} currentUserId={currentUserId}
                onEdit={handleEdit} onDelete={handleDelete}
                onReply={(parentId, content) => handleSubmit(content, parentId)} />
            ))}
          </>
        )}

        {tab === "comments" && (
          nestedComments.length === 0
            ? <p className="text-xs text-gray-300 italic">No comments yet.</p>
            : nestedComments.map((c) => (
                <CommentItem key={c.id} comment={c} depth={0} currentUserId={currentUserId}
                  onEdit={handleEdit} onDelete={handleDelete}
                  onReply={(parentId, content) => handleSubmit(content, parentId)} />
              ))
        )}

        {tab === "history" && (
          activities.length === 0
            ? <p className="text-xs text-gray-300 italic">No history yet.</p>
            : <div className="space-y-3">{activities.map((log) => <ActivityLogItem key={log.id} log={log} />)}</div>
        )}
      </div>
    </div>
  );
}