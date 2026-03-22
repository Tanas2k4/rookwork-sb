import { useState } from "react";
import type { Task, Status, Priority, User } from "../../../types/project";
import { childTypeMap } from "../../../types/project";
import { TaskPanelHeader } from "./TaskPanelHeader";
import { TaskPanelDetails } from "./TaskPanelDetails";
import { ChildrenSection } from "./ChildrenSection";
import { SubtasksSection } from "./SubtasksSection";
import { ActivitySection } from "./ActivitySection";
import type { Comment } from "../../../types/project";
import { workLogApi } from "../../../api/workLogApi";
import { RiTimeLine } from "react-icons/ri";

interface Props {
  task: Task | null;
  open: boolean;
  allTasks: Task[];
  comments: Comment[];
  onClose: () => void;
  onOpenTask: (task: Task) => void;
  onSaveTitle: (title: string) => void;
  onSaveDescription: (desc: string) => void;
  onChangeStatus: (s: Status) => void;
  onChangePriority: (p: Priority) => void;
  onChangeAssignee: (u: User | null) => void;
  onSaveDeadline: (val: string) => void;
  onDeleteTask: (task: Task) => void;
  onLink: (parentId: number, childId: number) => void;
  onUnlink: (parentId: number, childId: number) => void;
  onToggleSubtask: (id: number) => void;
  onAddSubtask: (title: string) => void;
  onDeleteSubtask: (id: number) => void;
  onSubmitComment: (content: string, parentId?: number) => void;
  onEditComment: (id: number, content: string) => void;
  onDeleteComment: (id: number) => void;
}

// ── Log Work Section ───────────────────────────────────────
function LogWorkSection({ taskId }: { taskId: string }) {
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit() {
    const h = parseFloat(hours);
    if (!hours || isNaN(h) || h <= 0) {
      setError("Please enter valid hours (e.g. 1.5)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await workLogApi.logWork({ issueId: taskId, hours: h, note: note.trim() || undefined });
      setHours("");
      setNote("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError("Failed to log work");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 hover:text-purple-600 transition"
      >
        <RiTimeLine size={14} />
        Log Work
        <span className={`ml-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
      </button>

      {expanded && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
          {/* Hours input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Hours spent <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={hours}
              onChange={(e) => { setHours(e.target.value); setError(""); }}
              placeholder="e.g. 1.5"
              className={`w-full text-sm border-2 rounded-lg px-3 py-2 outline-none transition bg-white ${
                error ? "border-red-400" : "border-gray-200 focus:border-purple-500"
              }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* Note input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Note <span className="text-gray-300">optional</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="What did you work on?"
              className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 outline-none transition bg-white focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-purple-900 hover:bg-purple-800 disabled:opacity-60 text-white text-xs font-medium py-2 rounded-lg transition"
          >
            <RiTimeLine size={13} />
            {loading ? "Logging..." : success ? "✓ Logged!" : "Log Work"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────
export function TaskPanel({
  task,
  open,
  allTasks,
  comments,
  onClose,
  onOpenTask,
  onSaveTitle,
  onSaveDescription,
  onChangeStatus,
  onChangePriority,
  onChangeAssignee,
  onSaveDeadline,
  onDeleteTask,
  onLink,
  onUnlink,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDescValue, setEditDescValue] = useState("");

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {task && (
          <>
            <TaskPanelHeader
              task={task}
              allTasks={allTasks}
              onClose={onClose}
              onSaveTitle={onSaveTitle}
              onOpenTask={onOpenTask}
            />

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </p>
                {editingDesc ? (
                  <textarea
                    autoFocus
                    value={editDescValue}
                    onChange={(e) => setEditDescValue(e.target.value)}
                    rows={3}
                    onBlur={() => { onSaveDescription(editDescValue); setEditingDesc(false); }}
                    onKeyDown={(e) => { if (e.key === "Escape") setEditingDesc(false); }}
                    className="w-full text-sm text-gray-600 outline-none rounded-lg p-2.5 resize-none border border-purple-300 focus:ring-1 focus:ring-purple-600 transition"
                  />
                ) : (
                  <p
                    onDoubleClick={() => { setEditingDesc(true); setEditDescValue(task.description ?? ""); }}
                    className="text-sm text-gray-600 cursor-default rounded px-1 -mx-1 py-0.5 hover:bg-gray-50 transition min-h-[24px]"
                    title="Double-click to edit"
                  >
                    {task.description || (
                      <span className="italic text-gray-300">No description — double-click to add</span>
                    )}
                  </p>
                )}
              </div>

              <TaskPanelDetails
                task={task}
                onChangeStatus={onChangeStatus}
                onChangePriority={onChangePriority}
                onChangeAssignee={onChangeAssignee}
                onSaveDeadline={onSaveDeadline}
              />

              {childTypeMap[task.type] && (
                <ChildrenSection
                  task={task}
                  allTasks={allTasks}
                  onOpenTask={onOpenTask}
                  onLink={onLink}
                  onUnlink={onUnlink}
                />
              )}

              <SubtasksSection
                subtasks={task.subtasks}
                onToggle={onToggleSubtask}
                onAdd={onAddSubtask}
                onDelete={onDeleteSubtask}
              />

              {/* Log Work — task.id là number (UI type), cần UUID thật */}
              {/* TODO: sau khi wire BoardView với real API, đổi task.id → task.uuid */}
              <LogWorkSection taskId={String(task.id)} />

              <ActivitySection
                comments={comments}
                onSubmit={onSubmitComment}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
              />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex justify-end gap-2 bg-white">
              {confirmDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Delete this task?</span>
                  <button
                    onClick={() => { setConfirmDelete(false); onDeleteTask(task); }}
                    className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm px-3 py-1.5 border border-gray-400 text-gray-600 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm px-4 py-2 border border-gray-500 text-gray-700 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition"
                >
                  Delete task
                </button>
              )}
              <button
                onClick={onClose}
                className="text-sm px-4 py-2 border border-gray-200 bg-purple-900 hover:bg-purple-800 text-gray-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}