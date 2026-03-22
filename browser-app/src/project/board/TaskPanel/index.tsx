import { useState } from "react";
import type { Task, Status, Priority, User } from "../../../types/project";
import { childTypeMap } from "../../../types/project";
import { TaskPanelHeader } from "./TaskPanelHeader";
import { TaskPanelDetails } from "./TaskPanelDetails";
import { ChildrenSection } from "./ChildrenSection";
import { SubtasksSection } from "./SubtasksSection";
import { ActivitySection } from "./ActivitySection";
import type { Comment } from "../../../types/project";

interface Props {
  task: Task | null;
  open: boolean;
  allTasks: Task[];
  comments: Comment[];
  onClose: () => void;
  onOpenTask: (task: Task) => void;
  // task actions
  onSaveTitle: (title: string) => void;
  onSaveDescription: (desc: string) => void;
  onChangeStatus: (s: Status) => void;
  onChangePriority: (p: Priority) => void;
  onChangeAssignee: (u: User | null) => void;
  onSaveDeadline: (val: string) => void;
  onDeleteTask: (task: Task) => void;
  // hierarchy
  onLink: (parentId: number, childId: number) => void;
  onUnlink: (parentId: number, childId: number) => void;
  // subtasks
  onToggleSubtask: (id: number) => void;
  onAddSubtask: (title: string) => void;
  onDeleteSubtask: (id: number) => void;
  // comments
  onSubmitComment: (content: string, parentId?: number) => void;
  onEditComment: (id: number, content: string) => void;
  onDeleteComment: (id: number) => void;
}

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
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
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

            {/* Body */}
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
                    onBlur={() => {
                      onSaveDescription(editDescValue);
                      setEditingDesc(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditingDesc(false);
                    }}
                    className="w-full text-sm text-gray-600 outline-none rounded-lg p-2.5 resize-none border border-purple-300 focus:ring-1 focus:ring-purple-600 transition"
                  />
                ) : (
                  <p
                    onDoubleClick={() => {
                      setEditingDesc(true);
                      setEditDescValue(task.description ?? "");
                    }}
                    className="text-sm text-gray-600 cursor-default rounded px-1 -mx-1 py-0.5 hover:bg-gray-50 transition min-h-[24px]"
                    title="Double-click to edit"
                  >
                    {task.description || (
                      <span className="italic text-gray-300">
                        No description — double-click to add
                      </span>
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
                  <span className="text-sm text-gray-600">
                    Delete this task?
                  </span>
                  <button
                    onClick={() => {
                      setConfirmDelete(false);
                      onDeleteTask(task);
                    }}
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
