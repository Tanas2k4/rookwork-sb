export interface DailyHours {
  label: string;
  hours: number;
}

export interface WorkStatsResponse {
  thisWeek: DailyHours[];
  lastWeek: DailyHours[];
}

export interface LogWorkRequest {
  issueId: string;
  hours: number;
  loggedAt?: string; // "YYYY-MM-DD"
  note?: string;
}

export interface WorkLogResponse {
  id: string;
  issueId: string;
  issueName: string;
  hours: number;
  loggedAt: string;
  note: string | null;
}
