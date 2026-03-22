const KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

function parseJwtSubject(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub ?? null; // JWT subject = userId
  } catch {
    return null;
  }
}

export const tokenStorage = {
  save: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(KEYS.access, accessToken);
    localStorage.setItem(KEYS.refresh, refreshToken);
  },
  getAccess: () => localStorage.getItem(KEYS.access),
  getRefresh: () => localStorage.getItem(KEYS.refresh),
  getUserId: (): string | null => {
    const token = localStorage.getItem(KEYS.access);
    return token ? parseJwtSubject(token) : null;
  },
  clear: () => {
    localStorage.removeItem(KEYS.access);
    localStorage.removeItem(KEYS.refresh);
  },
};