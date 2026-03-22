import { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import type { Subtask } from "../../../types/project";

interface Props {
  subtasks: Subtask[];
  onToggle: (id: number) => void;
  onAdd: (title: string) => void;
  onDelete: (id: number) => void;
}

export function SubtasksSection({
  subtasks,
  onToggle,
  onAdd,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [value, setValue] = useState("");
  const doneCount = subtasks.filter((s) => s.done).length;

  function submit() {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Subtasks ({doneCount}/{subtasks.length})
        </p>
        <button
          onClick={() => {
            setShowForm((p) => !p);
            setValue("");
          }}
          className="flex items-center gap-0.5 text-xs text-purple-700 hover:text-purple-900 transition"
        >
          <MdAdd size={13} />
          {showForm ? "Cancel" : "Add"}
        </button>
      </div>

      {subtasks.length > 0 && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-3">
          <div
            className="h-1.5 bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${(doneCount / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      <div className="space-y-1.5">
        {subtasks.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center gap-2 group/sub py-0.5"
          >
            <input
              type="checkbox"
              checked={sub.done}
              onChange={() => onToggle(sub.id)}
              className="accent-purple-700 w-3.5 h-3.5 cursor-pointer shrink-0"
            />
            <span
              className={`text-sm flex-1 ${sub.done ? "line-through text-gray-400" : "text-gray-700"}`}
            >
              {sub.title}
            </span>
            <button
              onClick={() => onDelete(sub.id)}
              className="opacity-0 group-hover/sub:opacity-100 text-gray-300 hover:text-red-400 transition"
            >
              <MdClose size={13} />
            </button>
          </div>
        ))}
        {subtasks.length === 0 && !showForm && (
          <p className="text-xs text-gray-300 italic">No subtasks yet</p>
        )}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${showForm ? "opacity-100 max-h-40 mt-2" : "opacity-0 max-h-0 mt-0"}`}
      >
        <div className="flex flex-col gap-2 bg-gray-100 rounded-md border border-purple-600 px-3 py-2">
          <input
            autoFocus={showForm}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") setShowForm(false);
            }}
            placeholder="Subtask title..."
            className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="text-[10px] text-gray-500 border border-gray-500 p-1 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="text-xs bg-purple-800 text-white rounded px-2.5 py-1 hover:bg-purple-700 transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
