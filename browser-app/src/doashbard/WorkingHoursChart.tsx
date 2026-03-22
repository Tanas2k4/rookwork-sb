import { useState, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RiCheckLine, RiArrowDownSLine } from "react-icons/ri";

const CHART_DATA_WEEKLY = [
  { label: "Sun", thisWeek: 0.5, lastWeek: 0.5 },
  { label: "Mon", thisWeek: 3.5, lastWeek: 4.0 },
  { label: "Tue", thisWeek: 6.5, lastWeek: 7.5 },
  { label: "Wed", thisWeek: 5.0, lastWeek: 5.0 },
  { label: "Thu", thisWeek: 8.5, lastWeek: 8.0 },
  { label: "Fri", thisWeek: 4.0, lastWeek: 1.5 },
  { label: "Sat", thisWeek: 9.5, lastWeek: 9.0 },
];

const CHART_DATA_MONTHLY = [
  { label: "Jan", thisWeek: 42, lastWeek: 38 },
  { label: "Feb", thisWeek: 55, lastWeek: 60 },
  { label: "Mar", thisWeek: 48, lastWeek: 45 },
  { label: "Apr", thisWeek: 70, lastWeek: 62 },
  { label: "May", thisWeek: 65, lastWeek: 58 },
  { label: "Jun", thisWeek: 80, lastWeek: 74 },
  { label: "Jul", thisWeek: 90, lastWeek: 85 },
  { label: "Aug", thisWeek: 78, lastWeek: 72 },
  { label: "Sep", thisWeek: 60, lastWeek: 55 },
  { label: "Oct", thisWeek: 50, lastWeek: 48 },
  { label: "Nov", thisWeek: 45, lastWeek: 40 },
  { label: "Dec", thisWeek: 35, lastWeek: 30 },
];

const OPTIONS = [
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
] as const;

//  Custom Dropdown 
function PeriodDropdown({
  value,
  onChange,
}: {
  value: "Weekly" | "Monthly";
  onChange: (v: "Weekly" | "Monthly") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 border border-gray-500 rounded-lg px-3 py-1.5 hover:bg-gray-100 hover:border-gray-500 transition-all"
      >
        {value}
        <RiArrowDownSLine
          size={14}
          className=" transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-100/80 z-50 overflow-hidden py-1"
          style={{ animation: "fadeSlideDown 0.12s ease-out" }}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs  transition-colors  hover:bg-gray-100"
              style={{ color: value === opt.value ? "#7c3aed" : "#4b5563" }}
            >
              {opt.label}
              {value === opt.value && (
                <RiCheckLine size={13} className="text-purple-500" />
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

//  Chart components 
function CustomDot(props: {
  cx?: number;
  cy?: number;
  index?: number;
  dataKey?: string;
  period: "Weekly" | "Monthly";
}) {
  const { cx, cy, index, dataKey, period } = props;
  const highlightIndex = period === "Weekly" ? 5 : 6;
  if (dataKey === "thisWeek" && index === highlightIndex) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="#22c55e" opacity={0.2} />
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#22c55e"
          stroke="white"
          strokeWidth={2}
        />
      </g>
    );
  }
  return <g />;
}

interface TooltipEntry {
  dataKey?: string | number;
  color?: string;
  value?: number;
}

function ChartTooltip({
  active,
  payload,
  label,
  period,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  period: "Weekly" | "Monthly";
}) {
  if (!active || !payload?.length) return null;
  const unit = period === "Weekly" ? "h" : "h total";
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-xs min-w-[130px] shadow-sm">
      <p className="font-heading font-semibold text-gray-600 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-gray-400">
            {entry.dataKey === "thisWeek" ? "This Period" : "Last Period"}
          </span>
          <span className="font-bold ml-auto" style={{ color: entry.color }}>
            {entry.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

//  Main Export 
export default function WorkingHoursChart() {
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");
  const data = period === "Weekly" ? CHART_DATA_WEEKLY : CHART_DATA_MONTHLY;
  const yMax = period === "Weekly" ? 10 : 100;
  const yTicks =
    period === "Weekly" ? [0, 2, 4, 6, 8, 10] : [0, 25, 50, 75, 100];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <h2 className="font-heading font-bold text-gray-800 text-base">
          Statistics
        </h2>
        <PeriodDropdown value={period} onChange={setPeriod} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500 font-medium">Working Hours</p>
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block bg-[#22c55e]" />
            This {period === "Weekly" ? "Week" : "Month"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block bg-[#f43f5e]" />
            Last {period === "Weekly" ? "Week" : "Month"}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
        >
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            domain={[0, yMax]}
            ticks={yTicks}
            tick={{ fontSize: 10, fill: "#cbd5e1" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip period={period} />}
            cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="lastWeek"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: "#f43f5e",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
          <Line
            type="monotone"
            dataKey="thisWeek"
            stroke="#22c55e"
            strokeWidth={2}
            dot={<CustomDot period={period} />}
            activeDot={{
              r: 4,
              fill: "#22c55e",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
