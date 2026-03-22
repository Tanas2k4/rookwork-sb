import { MdCheckCircle, MdClose } from "react-icons/md";
import type { Toast } from "../../types/project";

interface Props {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white pointer-events-auto transition-all duration-300 ${
            t.type === "success"
              ? "bg-green-600"
              : t.type === "error"
                ? "bg-red-500"
                : "bg-blue-600"
          }`}
        >
          <MdCheckCircle size={16} />
          {t.message}
          <button
            onClick={() => onRemove(t.id)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <MdClose size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
