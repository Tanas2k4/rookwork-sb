// ─── Types ───────────────────────────────────────────────────────────────────

export type ViewMode = "Month" | "Week" | "Day";

export type Guest = {
  name: string;
  role: string;
  avatar: string;
};

export type CalendarEvent = {
  id: number;
  date: Date;
  time: string;
  endTime: string;
  title: string;
  color: string;
  location: string;
  guests: Guest[];
  note: string;
};

export type EventForm = {
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  note: string;
  color: string;
  guestInput: string;
  guests: Guest[];
};

// ─── Constants ───────────────────────────────────────────────────────────────

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const EVENT_COLORS = [
  { label: "Violet",  value: "bg-violet-800/70" },
  { label: "Sky",     value: "bg-sky-800/70" },
  { label: "Emerald", value: "bg-emerald-800/70" },
  { label: "Amber",   value: "bg-amber-800/70" },
  { label: "Pink",    value: "bg-pink-800/70" },
  { label: "Rose",    value: "bg-rose-800/70" },
  { label: "Indigo",  value: "bg-indigo-800/70" },
];

export const VIEW_OPTIONS: ViewMode[] = ["Month", "Week", "Day"];

export const COLOR_MAP: Record<
  string,
  { dot: string; bg: string; text: string; time: string; border: string }
> = {
  violet:  { dot: "bg-purple-800",  bg: "bg-purple-50",  text: "text-purple-800",  time: "text-gray-600", border: "border border-purple-800" },
  sky:     { dot: "bg-sky-800",     bg: "bg-sky-50",     text: "text-sky-800",     time: "text-gray-600", border: "border border-sky-800" },
  emerald: { dot: "bg-emerald-800", bg: "bg-emerald-50", text: "text-emerald-800", time: "text-gray-600", border: "border border-emerald-800" },
  amber:   { dot: "bg-amber-800",   bg: "bg-amber-50",   text: "text-amber-800",   time: "text-gray-600", border: "border border-amber-800" },
  pink:    { dot: "bg-pink-800",    bg: "bg-pink-50",    text: "text-pink-800",    time: "text-gray-600", border: "border border-pink-800" },
  rose:    { dot: "bg-rose-800",    bg: "bg-rose-50",    text: "text-rose-800",    time: "text-gray-600", border: "border border-rose-800" },
  indigo:  { dot: "bg-indigo-800",  bg: "bg-indigo-50",  text: "text-indigo-800",  time: "text-gray-600", border: "border border-indigo-800" },
};

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 2,
    date: new Date(2026, 2, 5),
    time: "14:00",
    endTime: "15:00",
    title: "Design Review",
    color: "bg-sky-800/50 border border-sky-800 text-sky-800",
    location: "zoom.us/j/def456",
    guests: [
      { name: "Carol Le",   role: "organizer", avatar: "CL" },
      { name: "David Pham", role: "attendee",  avatar: "DP" },
      { name: "Eva Hoang",  role: "attendee",  avatar: "EH" },
    ],
    note: "Bring your latest mockups for review.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function getStartOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function getColorName(color: string) {
  const m = color.match(/(violet|sky|emerald|amber|pink|rose|indigo)/);
  return m ? m[1] : "violet";
}