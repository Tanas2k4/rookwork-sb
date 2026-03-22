import { useState } from "react";
import type { TaskPriority, TaskStatus, TaskType } from "../../types/project";
import {
  timelineTasks,
  overdueCount,
  dueSoonCount,
} from "../../mocks/overview";

function TypeChip({ type }: { type: TaskType }) {
  const cls: Record<TaskType, string> = {
    epic: "bg-violet-100 text-violet-700",
    story: "bg-sky-100 text-sky-700",
    task: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${cls[type]}`}
    >
      {type}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cls: Record<TaskPriority, string> = {
    urgent: "bg-red-100 text-red-600",
    high: "bg-orange-50 text-orange-500",
    medium: "bg-orange-50 text-orange-600",
    low: "bg-green-50 text-green-600",
  };
  return (
    <span
      className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${cls[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg: Record<TaskStatus, { cls: string; label: string }> = {
    to_do: { cls: "bg-gray-100 text-gray-800 border-none", label: "To Do" },
    in_progress: {
      cls: "bg-blue-100 text-blue-800 border-none",
      label: "In Progress",
    },
    done: { cls: "bg-green-100 text-green-800 border-none", label: "Done" },
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${cfg[status].cls}`}
    >
      {cfg[status].label}
    </span>
  );
}

export default function DeadlineTimeline() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm col-span-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-800">
          Deadline Timeline
        </h2>
        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <span className="text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full">
              {overdueCount} overdue
            </span>
          )}
          {dueSoonCount > 0 && (
            <span className="text-[14px] font-semibold text-orange-600 px-2.5 py-1 rounded-full">
              {dueSoonCount} due soon
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 mb-1">
        {[
          { dot: "bg-red-600", label: "Overdue" },
          { dot: "bg-orange-600", label: "≤2 days" },
          { dot: "bg-orange-600", label: "≤7 days" },
          { dot: "bg-blue-600", label: "Upcoming" },
          { dot: "bg-green-600", label: "Done" },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-[9px] text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {timelineTasks.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">
          No deadlines found.
        </p>
      ) : (
        <div className="relative px-4 py-6">
          <div className="absolute top-[53px] left-8 right-8 h-px bg-gray-400" />
          <div className="flex items-start justify-between gap-1 relative">
            {timelineTasks.map((item) => {
              const isOverdue = item.daysLeft < 0;
              const isUrgent = item.daysLeft >= 0 && item.daysLeft <= 2;
              const isSoon = item.daysLeft > 2 && item.daysLeft <= 7;
              const isDone = item.status === "done";

              const nodeBg = isDone
                ? "bg-green-600 border-none"
                : isOverdue
                  ? "bg-red-600 border-none"
                  : isUrgent
                    ? "bg-orange-600 border-none"
                    : isSoon
                      ? "bg-orange-600 border-none"
                      : "bg-blue-600 border-none";

              const labelCls = isOverdue
                ? "text-red-600"
                : isUrgent
                  ? "text-orange-600"
                  : isSoon
                    ? "text-orange-600"
                    : isDone
                      ? "text-green-600"
                      : "text-gray-600";

              const daysLabel = isDone
                ? "Done"
                : isOverdue
                  ? `${Math.abs(item.daysLeft)}d ago`
                  : item.daysLeft === 0
                    ? "Today"
                    : item.daysLeft === 1
                      ? "1d left"
                      : `${item.daysLeft}d`;

              const isHovered = hovered === item.id;

              return (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-1.5 cursor-pointer relative"
                  style={{ minWidth: 0, flex: 1 }}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    className={`text-[9px] font-semibold whitespace-nowrap ${labelCls}`}
                  >
                    {item.deadlineLabel}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 z-10 shrink-0 transition-transform duration-150 ${nodeBg} ${isHovered ? "scale-125" : ""}`}
                  />
                  <span
                    className={`text-[9px] font-semibold whitespace-nowrap ${labelCls}`}
                  >
                    {daysLabel}
                  </span>
                  <span className="text-[9px] text-gray-500 text-center leading-tight max-w-[72px] truncate px-0.5">
                    {item.title}
                  </span>
                  <TypeChip type={item.type} />

                  {isHovered && (
                    <div className="absolute top-full mt-2 left-1/2 z-50 w-52 bg-white border border-gray-200 rounded-xl shadow-xl p-3 pointer-events-none">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TypeChip type={item.type} />
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <p className="text-[12px] font-semibold text-gray-800 leading-snug mb-2">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mb-2">
                        {item.assigned_to ? (
                          <img
                            src={item.assigned_to.avt}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gray-200 rounded-full" />
                        )}
                        <span className="text-[10px] text-gray-500">
                          {item.assigned_to?.display_name ?? "Unassigned"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <StatusBadge status={item.status} />
                        <span
                          className={`text-[10px] font-semibold ${labelCls}`}
                        >
                          {item.deadlineLabel}
                        </span>
                      </div>
                      {item.subtasks.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="h-1 bg-gray-100 rounded-full flex-1 overflow-hidden">
                            <div
                              className="h-full bg-blue-300 rounded-full"
                              style={{
                                width: `${Math.round((item.subtasks.filter((s) => s.done).length / item.subtasks.length) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-gray-400 shrink-0">
                            {item.subtasks.filter((s) => s.done).length}/
                            {item.subtasks.length}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
