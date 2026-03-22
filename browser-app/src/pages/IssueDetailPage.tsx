import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  MOCK_TASKS,
  MOCK_COMMENTS,
  MOCK_USERS,
  CURRENT_USER,
} from "../mocks/board";
import {
  type Task,
  type Status,
  type Priority,
  type User,
  statusMap,
  statuses,
  priorityColorMap,
  priorityLabelMap,
  priorities,
  typeIconMap,
  typeColorMap,
} from "../types/project";

// Reuse existing section components
import { SubtasksSection } from "../project/board/TaskPanel/SubtasksSection";
import {
  ActivitySection,
  type ActivityLog,
} from "../project/board/TaskPanel/ActivitySection";
import { ChildrenSection } from "../project/board/TaskPanel/ChildrenSection";
import { MdOutlineExpandMore } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";

// ─── Helpers (reused from TaskPanelDetails) ───────────────────────────────────

function PriorityBars({ priority }: { priority: Priority }) {
  const idx = priorities.indexOf(priority);
  return (
    <div className="flex gap-0.5 h-1.5 w-14">
      {priorities.map((p, i) => (
        <div
          key={p}
          className={`flex-1 rounded-sm ${i <= idx ? priorityColorMap[p] : "bg-gray-200"}`}
        />
      ))}
    </div>
  );
}

function InlineDropdown({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-purple-700 transition group"
      >
        {trigger}
      </button>
      {open && (
        <>
          <div
            className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg 
            shadow-lg py-1 z-30 min-w-[160px] max-w-[200px]"
          >
            {children}
          </div>
          <div
            className="fixed inset-0 z-[29]"
            onClick={() => setOpen(false)}
          />
        </>
      )}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const found = MOCK_TASKS.find((t) => t.id === Number(issueId));
  const [task, setTask] = useState<Task | null>(found ?? null);

  const initialComments = MOCK_COMMENTS.filter(
    (c) => c.taskId === Number(issueId),
  );
  const [comments, setComments] = useState(initialComments);

  // Activity logs — thay bằng data thật từ API khi có
  const [activityLogs] = useState<ActivityLog[]>([]);

  const [editingDesc, setEditingDesc] = useState(false);
  const [editDescValue, setEditDescValue] = useState("");

  function patchTask(updates: Partial<Task>) {
    setTask((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p className="text-sm">Issue #{issueId} not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 text-xs text-purple-700 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  type LocationState = { from?: { label?: string; path?: string } };
  const routeState = location.state as LocationState | null;
  const backLabel = routeState?.from?.label ?? "My Issues";
  const backPath = routeState?.from?.path ?? "/my-issues";

  const TypeIcon = typeIconMap[task.type];
  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "done" &&
    task.status !== "to_do";

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 px-8 pt-5 text-gray-700 hover:text-purple-700 transition"
      >
        <IoIosArrowBack />
        <button className="text-sm  ">{backLabel}</button>
      </div>

      {/* ── Title area ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-8 pt-2 pb-5 border-b border-gray-100">
        {/* Title + inline actions */}
        <div className="flex items-center justify-between gap-3">
          <TypeIcon size={13} className={typeColorMap[task.type]} />
          <h1 className="text-xl font-semibold text-gray-700 leading-snug flex-1 pt-1 min-w-0">
            {task.title}
          </h1>

          <div className="flex flex-row items-center gap-4 pt-0.5 flex-wrap justify-end ">
            {/* Status */}
            <span className="text-xs text-gray-400">
              Status{" "}
              <InlineDropdown
                trigger={
                  <span className="flex items-center gap-1.5 border border-gray-500 rounded-md px-2 py-1">
                    <span
                      className={`w-2 h-2 rounded-full ${statusMap[task.status].dotColor}`}
                    />
                    {statusMap[task.status].label}
                    <MdOutlineExpandMore className="text-gray-500" />
                  </span>
                }
              >
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => patchTask({ status: s as Status })}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${task.status === s ? "text-purple-700 font-medium" : "text-gray-700"}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusMap[s as Status].dotColor}`}
                    />
                    {statusMap[s as Status].label}
                  </button>
                ))}
              </InlineDropdown>
            </span>

            {/* Priority */}
            <span className="text-xs text-gray-400">
              Priority{" "}
              <InlineDropdown
                trigger={
                  <span className="flex items-center gap-1.5 border border-gray-500 rounded-md px-2 py-1 ">
                    <PriorityBars priority={task.priority} />
                    {priorityLabelMap[task.priority]}
                    <MdOutlineExpandMore className="text-gray-500" />
                  </span>
                }
              >
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => patchTask({ priority: p as Priority })}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${task.priority === p ? "text-purple-700 font-medium" : "text-gray-700"}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${priorityColorMap[p as Priority]}`}
                    />
                    {priorityLabelMap[p as Priority]}
                  </button>
                ))}
              </InlineDropdown>
            </span>

            {/* Assignee */}
            <span className="flex items-center text-xs text-gray-400 gap-1">
              Assign{" "}
              <InlineDropdown
                trigger={
                  task.assigned_to ? (
                    <span className="flex items-center gap-1 max-w-[100px] overflow-hidden border border-gray-500 rounded-md px-2 py-1">
                      <img
                        src={task.assigned_to.avt}
                        className="w-4 h-4 rounded-full shrink-0"
                        alt=""
                      />
                      <span className="truncate">
                        {task.assigned_to.display_name}
                      </span>
                      <MdOutlineExpandMore className="text-gray-500" />
                    </span>
                  ) : (
                    <span className=" text-gray-500 border border-gray-500 rounded-md px-2 py-0.5">
                      Unassigned
                    </span>
                  )
                }
              >
                <button
                  onClick={() =>
                    patchTask({ assigned_to: null as unknown as User })
                  }
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-400 italic hover:bg-gray-50"
                >
                  Unassigned
                </button>
                {MOCK_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => patchTask({ assigned_to: u })}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${task.assigned_to?.id === u.id ? "text-purple-700 font-medium" : "text-gray-700"}`}
                  >
                    <img
                      src={u.avt}
                      className="w-5 h-5 rounded-full shrink-0"
                      alt=""
                    />
                    <span className="truncate">{u.display_name}</span>
                  </button>
                ))}
              </InlineDropdown>
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ══ LEFT ══ */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
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
                rows={4}
                onBlur={() => {
                  patchTask({ description: editDescValue });
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
                className="text-sm text-gray-600 cursor-default rounded px-1 -mx-1 py-1 hover:bg-gray-50 transition min-h-[24px] leading-relaxed"
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

          {/* Reuse SubtasksSection */}
          <SubtasksSection
            subtasks={task.subtasks}
            onToggle={(id) => {
              if (!task) return;
              patchTask({
                subtasks: task.subtasks.map((s) =>
                  s.id === id ? { ...s, done: !s.done } : s,
                ),
              });
            }}
            onAdd={(title) => {
              if (!task) return;
              patchTask({
                subtasks: [
                  ...task.subtasks,
                  { id: Date.now(), title, done: false },
                ],
              });
            }}
            onDelete={(id) => {
              if (!task) return;
              patchTask({ subtasks: task.subtasks.filter((s) => s.id !== id) });
            }}
          />

          {/* Reuse ActivitySection — bổ sung activityLogs prop */}
          <ActivitySection
            comments={comments}
            activityLogs={activityLogs}
            onSubmit={(content, parentId) => {
              if (!task) return;
              setComments((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  taskId: task.id,
                  userId: CURRENT_USER.id,
                  content,
                  createdAt: "just now",
                  parentId: parentId ?? null,
                },
              ]);
            }}
            onEdit={(id, content) => {
              setComments((prev) =>
                prev.map((c) => (c.id === id ? { ...c, content } : c)),
              );
            }}
            onDelete={(id) => {
              setComments((prev) => prev.filter((c) => c.id !== id));
            }}
          />
        </div>

        {/* ══ RIGHT — Details ══ */}
        <div className="w-96 flex-shrink-0 border-l border-gray-100 overflow-y-auto">
          <div className="px-5 py-6">
            <DetailRow label="Issue type">
              <span
                className={`inline-flex items-center gap-1.5 ${typeColorMap[task.type]}`}
              >
                <TypeIcon size={12} />
                <span className="text-gray-700 capitalize">{task.type}</span>
              </span>
            </DetailRow>

            <DetailRow label="Status">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${statusMap[task.status].dotColor}`}
                />
                <span className="text-gray-700">
                  {statusMap[task.status].label}
                </span>
              </span>
            </DetailRow>

            <DetailRow label="Priority">
              <span className="flex items-center gap-2">
                <PriorityBars priority={task.priority} />
                <span className="text-gray-700">
                  {priorityLabelMap[task.priority]}
                </span>
              </span>
            </DetailRow>

            <DetailRow label="Assigned to">
              {task.assigned_to ? (
                <span className="flex items-center gap-1.5">
                  <img
                    src={task.assigned_to.avt}
                    className="w-4 h-4 rounded-full shrink-0"
                    alt=""
                  />
                  <span className="text-gray-700">
                    {task.assigned_to.display_name}
                  </span>
                </span>
              ) : (
                <span className="text-gray-400 italic">Unassigned</span>
              )}
            </DetailRow>

            <div className="pt-3">
              <ChildrenSection
                task={task}
                allTasks={MOCK_TASKS}
                onOpenTask={(t) =>
                  navigate(`/issues/${t.id}`, {
                    state: {
                      from: { path: `/issues/${task.id}`, label: task.title },
                    },
                  })
                }
                onLink={(_parentId, childId) => {
                  patchTask({ childIds: [...(task.childIds ?? []), childId] });
                }}
                onUnlink={(_parentId, childId) => {
                  patchTask({
                    childIds: (task.childIds ?? []).filter(
                      (id) => id !== childId,
                    ),
                  });
                }}
              />
            </div>

            <DetailRow label="Deadline">
              {task.deadline ? (
                <span
                  className={
                    isOverdue ? "text-red-500 font-medium" : "text-gray-700"
                  }
                >
                  {task.deadline}
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </DetailRow>

            <DetailRow label="Created at">
              <span className="text-gray-400">—</span>
            </DetailRow>

            <DetailRow label="Updated at">
              <span className="text-gray-400">—</span>
            </DetailRow>
          </div>
        </div>
      </div>
    </div>
  );
}
