// URL base del backend. Vacía usa rutas relativas (/api), atendidas por el proxy de Vite o por Vercel.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const TOKEN_KEY = "safecore_token";
const USER_KEY = "safecore_user";

export type StoredUser = { id: number; name: string; email: string; role: string };

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function setUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

// Simula la latencia de red en los datos de ejemplo
export function mockResponse<T>(data: T, delay = 250): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), delay);
  });
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // El token de ejemplo no se envía
    ...(token && token !== "mock-token" ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? body?.title ?? body?.error ?? `Error ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
