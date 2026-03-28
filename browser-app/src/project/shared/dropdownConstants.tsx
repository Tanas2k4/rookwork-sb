import { FaTasks, FaBook, FaRocket } from "react-icons/fa";
import type { TaskType, Status } from "../../types/project";

export const typeOptions = [
  { label: "Task",  value: "task"  as TaskType, icon: <FaTasks  size={12} />, color: "bg-blue-100 text-blue-700"    },
  { label: "Story", value: "story" as TaskType, icon: <FaBook   size={12} />, color: "bg-green-100 text-green-700"  },
  { label: "Epic",  value: "epic"  as TaskType, icon: <FaRocket size={12} />, color: "bg-purple-100 text-purple-700"},
];

export const statusOptions = [
  { label: "To Do",       value: "to_do"       as Status, color: "bg-gray-100 text-gray-800"  },
  { label: "In Progress", value: "in_progress" as Status, color: "bg-blue-100 text-blue-800"  },
  { label: "Done",        value: "done"        as Status, color: "bg-green-100 text-green-800" },
];

export function formatDeadline(val: string): string {
  if (!val) return "No deadline";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}