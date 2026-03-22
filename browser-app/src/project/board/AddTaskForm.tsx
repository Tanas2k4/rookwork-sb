import { useState } from "react";
import { MdAdd } from "react-icons/md";
import type { TaskType, Priority } from "../../types/project";
import { typeLabelMap, priorities, priorityLabelMap } from "../../types/project";

interface Props {
  onSubmit: (title: string, type: TaskType, priority: Priority) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function AddTaskForm({ onSubmit, onCancel, submitting = false }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [priority, setPriority] = useState<Priority>("medium");

  function handleSubmit() {
    if (!title.trim() || submitting) return;
    onSubmit(title.trim(), type, priority);
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-purple-300 shadow-sm space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Task title..."
        disabled={submitting}
        className="w-full text-sm text-gray-800 outline-none disabled:opacity-50"
      />
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TaskType)}
          disabled={submitting}
          className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white disabled:opacity-50"
        >
          {(["task", "story", "epic"] as TaskType[]).map((t) => (
            <option key={t} value={t}>{typeLabelMap[t]}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          disabled={submitting}
          className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white disabled:opacity-50"
        >
          {priorities.map((p) => (
            <option key={p} value={p}>{priorityLabelMap[p]}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          disabled={submitting}
          className="text-xs text-gray-500 border border-gray-500 rounded-md hover:text-gray-700 px-2 py-1 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="text-xs bg-purple-800 text-white rounded px-3 py-1 hover:bg-purple-700 disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}

interface AddButtonProps {
  onClick: () => void;
}

export function AddTaskButton({ onClick }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg py-2 px-3 transition"
    >
      <MdAdd size={14} />
      Add task
    </button>
  );
}