import { tokenStorage } from "./tokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = tokenStorage.getAccess();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  // Token hết hạn → thử refresh
  if (res.status === 401) {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      tokenStorage.clear();
      window.location.href = "/login";
      throw new Error("Unauthenticated");
    }

    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
      tokenStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    const { accessToken: newToken } = await refreshRes.json();
    tokenStorage.save(newToken, refreshToken);

    // Retry với token mới
    return request<T>(path, options);
  }

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string) =>
    request<T>(path, { method: "GET" }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};