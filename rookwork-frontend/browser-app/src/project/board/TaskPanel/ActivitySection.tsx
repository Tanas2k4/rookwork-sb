import { useState } from "react";
import type { Comment } from "../../../types/project";
import { MOCK_USERS, CURRENT_USER } from "../../../mocks/board";

export interface ActivityLog {
  id: number;
  userId: number;
  action: string; // e.g. "changed status from To Do to In Progress"
  field: string;
  createdAt: string; // ISO 8601 — e.g. "2024-08-01T09:32:10Z"
}

// Format ISO → "01/08/2024 09:32:10"
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso; // fallback nếu không phải ISO
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

interface Props {
  comments: Comment[];
  activityLogs?: ActivityLog[];
  onSubmit: (content: string, parentId?: number) => void;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

// ─── Single Comment Item ──────────────────────────────────────────────────────

function CommentItem({
  comment,
  depth = 0,
  onEdit,
  onDelete,
  onReply,
}: {
  comment: Comment & { replies?: Comment[] };
  depth?: number;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onReply: (parentId: number, content: string) => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyValue, setReplyValue] = useState("");

  const author =
    MOCK_USERS.find((u) => u.id === comment.userId) ?? CURRENT_USER;
  const isOwn = comment.userId === CURRENT_USER.id;
  const isReply = depth > 0;

  return (
    <div>
      <div className="flex gap-2.5">
        <img
          src={author.avt}
          className={`rounded-full shrink-0 mt-0.5 ${isReply ? "w-5 h-5" : "w-7 h-7"}`}
          alt=""
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline gap-1.5 mb-1">
            <span
              className={`font-medium text-gray-800 ${isReply ? "text-[11px]" : "text-sm"}`}
            >
              {author.display_name}
            </span>
            <span
              className={`text-gray-400 ${isReply ? "text-[10px]" : "text-xs"}`}
            >
              {formatDateTime(comment.createdAt)}
            </span>
          </div>

          {/* Edit mode */}
          {editingId === comment.id ? (
            <div className="space-y-1.5">
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={2}
                className={`w-full text-gray-700 border border-purple-300 rounded-md p-2 resize-none outline-none bg-white ${isReply ? "text-xs" : "text-sm"}`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onEdit(comment.id, editValue);
                    setEditingId(null);
                  }}
                  className="text-xs bg-purple-800 text-white rounded px-2.5 py-1 hover:bg-purple-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Bubble */}
              <div
                className={`bg-white rounded-xl rounded-tl-sm px-3 py-1 ${isReply ? "text-xs" : "text-sm"} text-gray-700 break-words leading-relaxed`}
              >
                {comment.content}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-1 items-center">
                {depth === 0 && (
                  <button
                    onClick={() => setShowReplyBox((v) => !v)}
                    className="text-[11px] text-gray-400 hover:text-purple-600 transition"
                  >
                    {showReplyBox ? "Cancel reply" : "Reply"}
                  </button>
                )}
                {isOwn && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditValue(comment.content);
                      }}
                      className="text-[11px] text-gray-400 hover:text-gray-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="text-[11px] text-gray-400 hover:text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* Reply input */}
              {showReplyBox && (
                <div className="flex gap-1.5 mt-2">
                  <img
                    src={CURRENT_USER.avt}
                    className="w-5 h-5 rounded-full shrink-0 mt-0.5"
                    alt=""
                  />
                  <div className="flex-1 space-y-1.5">
                    <textarea
                      autoFocus
                      placeholder={`Reply to ${author.display_name}...`}
                      rows={2}
                      value={replyValue}
                      onChange={(e) => setReplyValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (replyValue.trim()) {
                            onReply(comment.id, replyValue);
                            setReplyValue("");
                            setShowReplyBox(false);
                          }
                        }
                      }}
                      className="w-full text-xs text-gray-700 border border-gray-300 rounded-md p-2 resize-none outline-none bg-white focus:border-transparent focus:ring-1 focus:ring-purple-400 transition"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setReplyValue("");
                          setShowReplyBox(false);
                        }}
                        className="text-[11px] text-gray-500 border border-gray-300 rounded-md hover:text-gray-700 px-2 py-0.5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (replyValue.trim()) {
                            onReply(comment.id, replyValue);
                            setReplyValue("");
                            setShowReplyBox(false);
                          }
                        }}
                        className="text-[11px] bg-purple-800 text-white rounded px-2.5 py-0.5 hover:bg-purple-700 transition"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2.5 pl-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Activity Log Item ────────────────────────────────────────────────────────

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const author = MOCK_USERS.find((u) => u.id === log.userId) ?? CURRENT_USER;
  return (
    <div className="flex gap-2.5 items-start">
      <img
        src={author.avt}
        className="w-6 h-6 rounded-full shrink-0 mt-0.5"
        alt=""
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-medium text-gray-800">
            {author.display_name}
          </span>{" "}
          {log.action}
        </p>
        <span className="text-[10px] text-gray-400">{formatDateTime(log.createdAt)}</span>
      </div>
    </div>
  );
}

// ─── Mock activity logs (replace with real data from API) ─────────────────────

const MOCK_LOGS: ActivityLog[] = [
  {
    id: 1,
    userId: 1,
    field: "status",
    action: "changed Status from To Do to In Progress",
    createdAt: "2024-08-01T07:14:22Z",
  },
  {
    id: 2,
    userId: 2,
    field: "assignee",
    action: "assigned this issue to Alex Johnson",
    createdAt: "2024-08-01T08:30:05Z",
  },
  {
    id: 3,
    userId: 1,
    field: "priority",
    action: "changed Priority from Medium to High",
    createdAt: "2024-08-02T13:47:59Z",
  },
  {
    id: 4,
    userId: 3,
    field: "deadline",
    action: "set Deadline to 2024-08-15",
    createdAt: "2024-08-03T17:05:33Z",
  },
];

// ─── Activity Section ─────────────────────────────────────────────────────────

type Tab = "all" | "comments" | "history";

export function ActivitySection({
  comments,
  activityLogs,
  onSubmit,
  onEdit,
  onDelete,
}: Props) {
  const [tab, setTab] = useState<Tab>("all");
  const [newComment, setNewComment] = useState("");
  const [focused, setFocused] = useState(false);

  const logs = activityLogs ?? MOCK_LOGS;

  const handleReply = (parentId: number, content: string) =>
    onSubmit(content, parentId);

  const topLevel = comments.filter((c) => !c.parentId);
  const withReplies = topLevel.map((c) => ({
    ...c,
    replies: comments.filter((r) => r.parentId === c.id),
  }));

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    {
      key: "comments",
      label: `Comments${comments.length ? ` (${comments.length})` : ""}`,
    },
    { key: "history", label: "History" },
  ];

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Activity
      </p>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex gap-0 border-b border-gray-200 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition ${
              tab === t.key
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── New comment input (shown on All + Comments tabs) ─────────────────── */}
      {tab !== "history" && (
        <div className="flex gap-2.5 mb-4">
          <img
            src={CURRENT_USER.avt}
            className="w-7 h-7 rounded-full shrink-0 mt-0.5"
            alt=""
          />
          <div className="flex-1 space-y-2">
            <textarea
              placeholder="Add a comment..."
              rows={focused ? 3 : 1}
              value={newComment}
              onFocus={() => setFocused(true)}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (newComment.trim()) {
                    onSubmit(newComment);
                    setNewComment("");
                    setFocused(false);
                  }
                }
              }}
              className="w-full text-sm text-gray-700 border border-gray-500 rounded-lg p-2.5 resize-none outline-none 
              bg-white focus:border-purple-300 focus:ring-1 focus:ring-purple-400 transition"
            />
            {(focused || newComment.trim()) && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setNewComment("");
                    setFocused(false);
                  }}
                  className="text-xs text-gray-700 border border-gray-500 rounded-md hover:bg-gray-100 px-2.5 py-1 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newComment.trim()) {
                      onSubmit(newComment);
                      setNewComment("");
                      setFocused(false);
                    }
                  }}
                  className="text-xs bg-purple-800 text-white rounded px-3 py-1 hover:bg-purple-700 transition"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* ALL tab — logs then comments interleaved */}
        {tab === "all" && (
          <>
            {logs.length === 0 && withReplies.length === 0 && (
              <p className="text-xs text-gray-300 italic">No activity yet.</p>
            )}
            {/* History entries */}
            {logs.map((log) => (
              <ActivityLogItem key={log.id} log={log} />
            ))}
            {/* Divider if both exist */}
            {logs.length > 0 && withReplies.length > 0 && (
              <div className="border-t border-gray-100" />
            )}
            {/* Comments */}
            {withReplies.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={handleReply}
              />
            ))}
          </>
        )}

        {/* COMMENTS tab */}
        {tab === "comments" && (
          <>
            {withReplies.length === 0 ? (
              <p className="text-xs text-gray-300 italic">No comments yet.</p>
            ) : (
              withReplies.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={handleReply}
                />
              ))
            )}
          </>
        )}

        {/* HISTORY tab */}
        {tab === "history" && (
          <>
            {logs.length === 0 ? (
              <p className="text-xs text-gray-300 italic">No history yet.</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <ActivityLogItem key={log.id} log={log} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}