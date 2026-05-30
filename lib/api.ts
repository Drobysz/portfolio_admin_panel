export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

const TOKEN_KEY = "portfolio_admin_token";

export type ApiCollection<T> = {
  data: T[];
  links?: Record<string, string | null>;
  meta?: Record<string, unknown>;
};

export type ApiResource<T> = {
  data: T;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin";
  created_at?: string;
  updated_at?: string;
};

export type Stack = {
  id: number;
  name: string;
  technologies?: string | null;
  project_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  period?: string | null;
  tag?: string | null;
  short_description?: string | null;
  description?: string | null;
  cover_image_path?: string | null;
  cover_image_url?: string | null;
  project_image_path?: string | null;
  project_image_url?: string | null;
  project_url?: string | null;
  repository_url?: string | null;
  sort_order: number;
  is_published: boolean;
  stacks: Stack[];
  created_at?: string;
  updated_at?: string;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? "The request failed.",
      response.status,
      payload?.errors,
    );
  }

  return payload as T;
}

export function validationSummary(error: unknown) {
  if (!(error instanceof ApiError) || !error.errors) {
    return error instanceof Error ? [error.message] : ["Something went wrong."];
  }

  return Object.entries(error.errors).flatMap(([field, messages]) =>
    messages.map((message) => `${field}: ${message}`),
  );
}
