import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WorkingHoursChart from "../doashbard/WorkingHoursChart";
import ActiveProjects from "../doashbard/ActiveProjects";
import { RiCheckLine, RiTrophyLine } from "react-icons/ri";
import Image from "../assets/image.png";
import { MOCK_TASKS, MOCK_USERS, CURRENT_USER } from "../mocks/board";
import type { TaskPriority, TaskStatus } from "../types/project";
import MiniCalendar from "../calendar/MiniCalendar";

//  Types 
interface Project {
  id: number;
  name: string;
  category: string;
  date: string;
  progress: number;
  accentColor: string;
  members: { avt: string; display_name: string }[];
  deadline: string;
  daysLeft: number;
}

//  Constants 
const MOCK_NOW = new Date(2026, 2, 8);

const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Mobile Application",
    category: "Design & Development",
    date: "Mar 5, 2026",
    progress: 72,
    accentColor: "#7c3aed",
    members: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]],
    deadline: "Mar 28, 2026",
    daysLeft: 20,
  },
  {
    id: 2,
    name: "Web Dashboard",
    category: "Frontend Development",
    date: "Feb 20, 2026",
    progress: 45,
    accentColor: "#f59e0b",
    members: [MOCK_USERS[1], MOCK_USERS[3]],
    deadline: "Apr 10, 2026",
    daysLeft: 33,
  },
  {
    id: 3,
    name: "Backend API",
    category: "Backend Development",
    date: "Feb 26, 2026",
    progress: 88,
    accentColor: "#f43f5e",
    members: [MOCK_USERS[2], MOCK_USERS[4], MOCK_USERS[0]],
    deadline: "Mar 31, 2026",
    daysLeft: 23,
  },
];

const markedDates = new Set(
  MOCK_TASKS.filter((t) => t.deadline && t.status !== "done").map(
    (t) => t.deadline as string,
  ),
);

//  Helpers 
const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f43f5e",
  urgent: "#7c3aed",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  to_do: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  to_do: "#94a3b8",
  in_progress: "#7c3aed",
  done: "#22c55e",
};

//  Stats 
const totalTasks = MOCK_TASKS.length;
const doneTasks = MOCK_TASKS.filter((t) => t.status === "done").length;
const teamCount = MOCK_USERS.length;

const STATS = [
  {
    label: "Active Projects",
    value: String(MOCK_PROJECTS.length),
    delta: `${MOCK_PROJECTS.length} total`,
    color: "#7c3aed",
  },
  {
    label: "Tasks Done",
    value: String(doneTasks),
    delta: `${Math.round((doneTasks / totalTasks) * 100)}% completed`,
    color: "#22c55e",
  },
  {
    label: "Team Members",
    value: String(teamCount),
    delta: "on this project",
    color: "#f43f5e",
  },
  {
    label: "Overdue",
    value: String(
      MOCK_TASKS.filter(
        (t) =>
          t.deadline && new Date(t.deadline) < MOCK_NOW && t.status !== "done",
      ).length,
    ),
    delta: "need attention",
    color: "#d97706",
  },
];

const WELCOME_PHRASES = [
  "A new day, a fresh start — let's work.",
  "Great things happen one task at a time.",
  "Focus, execute, and make it count today.",
  "Your best work starts right now.",
];

//  Animated Counter Hook 
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

//  Typewriter Component 
function TypewriterText() {
  const [phraseIdx, setPhraseIdx] = useState(() =>
    Math.floor(Math.random() * WELCOME_PHRASES.length),
  );
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "waiting" | "erasing">(
    "typing",
  );

  useEffect(() => {
    const phrase = WELCOME_PHRASES[phraseIdx];

    if (phase === "typing") {
      if (displayed.length < phrase.length) {
        const t = setTimeout(
          () => setDisplayed(phrase.slice(0, displayed.length + 1)),
          40,
        );
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("waiting"), 2200);
        return () => clearTimeout(t);
      }
    }

    if (phase === "waiting") {
      const t = setTimeout(() => setPhase("erasing"), 200);
      return () => clearTimeout(t);
    }

    if (phase === "erasing") {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), 18);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setPhraseIdx((i) => {
            let next = Math.floor(Math.random() * WELCOME_PHRASES.length);
            while (next === i)
              next = Math.floor(Math.random() * WELCOME_PHRASES.length);
            return next;
          });
          setPhase("typing");
        }, 0); // ← bọc vào setTimeout tránh setState đồng bộ trong effect
        return () => clearTimeout(t);
      }
    }
  }, [displayed, phase, phraseIdx]);

  return (
    <p className="text-sm text-gray-500 mb-1 h-5 flex items-center">
      {displayed}
      <span
        className="inline-block w-[1.5px] h-[13px] bg-gray-400 ml-[1px] align-middle"
        style={{ animation: "blink 1s step-end infinite" }}
      />
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </p>
  );
}

//  Stat Card 
function StatCard({
  value,
  label,
  delta,
  color,
}: {
  value: string;
  label: string;
  delta: string;
  color: string;
}) {
  const num = useCountUp(parseInt(value) || 0, 1200);

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 cursor-default">
      <div className="flex items-center gap-3">
        <div className="font-heading text-3xl font-bold text-gray-800 tracking-tight leading-none">
          {num}
        </div>
        <div>
          <div className="text-xs text-gray-400">{label}</div>
          <div className="text-[10px] font-semibold mt-0.5" style={{ color }}>
            {delta}
          </div>
        </div>
      </div>
    </div>
  );
}

//  Main Component 
export default function DashboardPage() {
  const tasks = MOCK_TASKS.filter((t) => t.status !== "done").slice(0, 4);

  const [calMonth, setCalMonth] = useState(MOCK_NOW.getMonth());
  const [calYear, setCalYear] = useState(MOCK_NOW.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <div
      className="min-h-screen bg-gray-100"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_296px] gap-5 items-start">
        {/*  LEFT COLUMN  */}
        <div className="space-y-4 min-w-0">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl px-7 py-6 border border-gray-100 flex items-center justify-between overflow-hidden">
            <div>
              <TypewriterText />
              <h1 className="font-heading text-3xl font-bold tracking-tight leading-tight">
                Hi{" "}
                <span style={{ color: "#7c3aed" }}>
                  {CURRENT_USER.display_name}
                </span>
                !
              </h1>
            </div>
            <div className="flex-shrink-0 w-28 h-20 flex items-center justify-center select-none">
              <img src={Image} alt="" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>

          {/* Active Projects */}
          <ActiveProjects />

          {/* Statistics Chart */}
          <WorkingHoursChart />
        </div>

        {/*  RIGHT SIDEBAR  */}
        <div className="space-y-5 min-w-0 xl:sticky xl:top-8">
          {/* MiniCalendar */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <MiniCalendar
              today={MOCK_NOW}
              currentMonth={calMonth}
              currentYear={calYear}
              selectedDate={selectedDate}
              markedDates={markedDates}
              onPrevMonth={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((y) => y - 1);
                } else {
                  setCalMonth((m) => m - 1);
                }
              }}
              onNextMonth={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((y) => y + 1);
                } else {
                  setCalMonth((m) => m + 1);
                }
              }}
              onSelectDate={setSelectedDate}
              onDoubleClickDate={setSelectedDate}
              onChangeMonth={setCalMonth}
              onChangeYear={setCalYear}
            />
          </div>

          {/* Today's Tasks — read-only */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-gray-700 text-sm">
                Today — Mar 8
              </h2>
            </div>

            <div className="relative pl-4">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isDone = task.status === "done";
                  const accentColor = PRIORITY_COLOR[task.priority];
                  const assignee = task.assigned_to;

                  return (
                    <div key={task.id} className="flex gap-3">
                      {/* Timeline dot */}
                      <div
                        className="relative z-10 mt-1 w-3.5 h-3.5 -ml-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                        style={{
                          borderColor: isDone ? accentColor : "#e5e7eb",
                          background: isDone ? accentColor : "white",
                        }}
                      >
                        {isDone && <RiCheckLine size={8} color="white" />}
                      </div>

                      {/* Card — clickable via Link */}
                      <Link
                        to={`/tasks/${task.id}`}
                        draggable={false}
                        className={`flex-1 rounded-xl p-3 border min-w-0 block transition-opacity hover:opacity-80 ${
                          isDone
                            ? "opacity-50 bg-gray-100 border-gray-100"
                            : "bg-gray-100 border-gray-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isDone
                                ? "line-through text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {task.title}
                          </p>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 border"
                            style={{
                              color: STATUS_COLOR[task.status],
                              borderColor: STATUS_COLOR[task.status] + "40",
                              background: STATUS_COLOR[task.status] + "10",
                            }}
                          >
                            {STATUS_LABEL[task.status]}
                          </span>
                        </div>

                        {task.deadline && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Due{" "}
                            {new Date(task.deadline).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </p>
                        )}

                        {assignee && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <img
                              src={assignee.avt}
                              alt={assignee.display_name}
                              className="w-5 h-5 rounded-full border border-white object-cover"
                              title={assignee.display_name}
                            />
                            <span className="text-[10px] text-gray-400 truncate max-w-[80px]">
                              {assignee.display_name.split(" ")[0]}
                            </span>
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })}

                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <RiTrophyLine
                      size={22}
                      className="mx-auto mb-2 text-amber-400"
                    />
                    <p className="text-xs font-medium">
                      All tasks done for today!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
