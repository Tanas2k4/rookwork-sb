import { useState, useEffect } from "react";
import { MOCK_TASKS } from "../../mocks/board";
import { overallProgress } from "../../mocks/overview";

function DonutChart({ animated }: { animated: boolean }) {
  const counts = {
    done: MOCK_TASKS.filter((t) => t.status === "done").length,
    in_progress: MOCK_TASKS.filter((t) => t.status === "in_progress").length,
    to_do: MOCK_TASKS.filter((t) => t.status === "to_do").length,
  };
  const data = [
    { label: "Done", value: counts.done, color: "#10b981" },
    { label: "In Progress", value: counts.in_progress, color: "#6366f1" },
    { label: "To Do", value: counts.to_do, color: "#cbd5e1" },
  ];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 48,
    cx = 60,
    cy = 60,
    sw = 16;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map((d) => {
    const realDash = (d.value / total) * circ;
    const dash = animated ? realDash : 0;
    const el = (
      <circle
        key={d.label}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={sw}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: `${cx}px ${cy}px`,
          transition: "stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    );
    offset += realDash;
    return el;
  });

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-[120px] h-[120px] shrink-0">
        <svg width={120} height={120}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={sw}
          />
          {segments}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black text-gray-900">{total}</span>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
            Tasks
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-[11px] text-gray-500 flex-1">{d.label}</span>
            <span className="text-sm font-semibold text-gray-800">
              {d.value}
            </span>
            <span className="text-[10px] text-gray-400 w-8 text-right">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverallProgress() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const progressBarColor =
    overallProgress === 100
      ? "bg-green-600"
      : overallProgress >= 80
        ? "bg-green-500"
        : overallProgress >= 60
          ? "bg-yellow-500"
          : overallProgress >= 30
            ? "bg-orange-500"
            : "bg-red-500";

  const progressTextColor =
    overallProgress === 100
      ? "text-green-600"
      : overallProgress >= 80
        ? "text-green-500"
        : overallProgress >= 60
          ? "text-yellow-500"
          : overallProgress >= 30
            ? "text-orange-500"
            : "text-red-500";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">
        Overall Progress
      </h2>

      <div className="mb-1">
        <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1.5">
          <span>Completion</span>
          <span className={`font-semibold ${progressTextColor}`}>
            {overallProgress}%
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressBarColor}`}
            style={{ width: animated ? `${overallProgress}%` : "0%" }}
          />
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4">
        <DonutChart animated={animated} />
      </div>
    </div>
  );
}
