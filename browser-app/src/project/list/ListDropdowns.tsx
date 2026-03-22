import type { RefObject } from "react";
import { IoClose } from "react-icons/io5";
import { FaTasks, FaBook, FaRocket } from "react-icons/fa";
import type { Task, User, Status, TaskType } from "../../types/project";
import type { DropdownState } from "../../hooks/useListView";

const typeOptions = [
  {
    label: "Task",
    value: "task" as TaskType,
    icon: <FaTasks size={12} />,
    color: "bg-blue-100 text-blue-700",
  },
  {
    label: "Story",
    value: "story" as TaskType,
    icon: <FaBook size={12} />,
    color: "bg-green-100 text-green-700",
  },
  {
    label: "Epic",
    value: "epic" as TaskType,
    icon: <FaRocket size={12} />,
    color: "bg-purple-100 text-purple-700",
  },
];

const statusOptions = [
  {
    label: "To Do",
    value: "to_do" as Status,
    color: "bg-gray-100 text-gray-800",
  },
  {
    label: "In Progress",
    value: "in_progress" as Status,
    color: "bg-blue-100 text-blue-800",
  },
  {
    label: "Done",
    value: "done" as Status,
    color: "bg-green-100 text-green-800",
  },
];

interface Props {
  openDropdown: DropdownState;
  dropdownRef: RefObject<HTMLDivElement>;
  tasks: Task[];
  users: User[];
  onAssignUser: (taskId: number, user: User | null) => void;
  onStatusChange: (taskId: number, status: Status) => void;
  onTypeChange: (taskId: number, type: TaskType) => void;
  onDeadlineChange: (taskId: number, deadline: string) => void;
}

export function ListDropdowns({
  openDropdown,
  dropdownRef,
  tasks,
  users,
  onAssignUser,
  onStatusChange,
  onTypeChange,
  onDeadlineChange,
}: Props) {
  if (!openDropdown.type || !openDropdown.position) return null;

  const { top, left, maxHeight } = openDropdown.position;
  const taskId = openDropdown.taskId!;
  const currentTask = tasks.find((t) => t.id === taskId);

  const baseStyle = {
    position: "fixed" as const,
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 100,
  };

  return (
    <>
      {openDropdown.type === "type" && (
        <div
          ref={dropdownRef}
          style={{ ...baseStyle, maxHeight: `${maxHeight}px` }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <div
            className="p-2 w-44 overflow-y-auto"
            style={{ maxHeight: `${maxHeight - 16}px` }}
          >
            {typeOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => onTypeChange(taskId, t.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded transition ${currentTask?.type === t.value ? "bg-purple-50" : ""}`}
              >
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${t.color}`}
                >
                  {t.icon}
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {openDropdown.type === "user" && (
        <div
          ref={dropdownRef}
          style={{ ...baseStyle, maxHeight: `${maxHeight}px` }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <div
            className="p-2 w-56 overflow-y-auto"
            style={{ maxHeight: `${maxHeight - 16}px` }}
          >
            <button
              onClick={() => onAssignUser(taskId, null)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
            >
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <IoClose size={14} className="text-gray-500" />
              </div>
              <span className="italic text-gray-500">Unassigned</span>
            </button>
            <div className="border-t border-gray-200 my-1" />
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => onAssignUser(taskId, u)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded transition ${currentTask?.assigned_to?.id === u.id ? "bg-purple-50 text-purple-700" : "text-gray-700"}`}
              >
                <img src={u.avt} className="w-6 h-6 rounded-full" />
                {u.display_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {openDropdown.type === "date" && (
        <div
          ref={dropdownRef}
          style={baseStyle}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-3"
        >
          <input
            type="date"
            value={currentTask?.deadline ?? ""}
            onChange={(e) => onDeadlineChange(taskId, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
        </div>
      )}

      {openDropdown.type === "status" && (
        <div
          ref={dropdownRef}
          style={{ ...baseStyle, maxHeight: `${maxHeight}px` }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <div
            className="p-2 w-44 overflow-y-auto"
            style={{ maxHeight: `${maxHeight - 16}px` }}
          >
            {statusOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => onStatusChange(taskId, s.value)}
                className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded transition ${currentTask?.status === s.value ? "bg-purple-50" : ""}`}
              >
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${s.color}`}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
