import type { components } from "@/api/generated/hbs-home-api";

export type ApiProblem = components["schemas"]["ProblemDetail"];
export type ApiHealth = components["schemas"]["HealthResponse"];
export type ApiReadiness = components["schemas"]["ReadinessResponse"];
export type ApiVersion = components["schemas"]["VersionResponse"];
export type ApiAdminSession = components["schemas"]["AdminSession"];
export type ApiAuditList = components["schemas"]["AuditListResponse"];

export class HbsApiError extends Error {
  readonly status: number;
  readonly problem?: ApiProblem;

  constructor(status: number, message: string, problem?: ApiProblem) {
    super(message);
    this.name = "HbsApiError";
    this.status = status;
    if (problem) this.problem = problem;
  }
}

export interface HbsApiClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

const API_BASE_URL_MISSING_ERROR = "VITE_HBS_API_BASE_URL est requis pour les appels API.";

function resolveBaseUrl(explicit?: string): string | null {
  const configured = explicit?.trim() || import.meta.env.VITE_HBS_API_BASE_URL?.trim();
  if (!configured) {
    if (import.meta.env.PROD) return null;
    return "http://localhost:3000";
  }
  try {
    const base = new URL(configured);
    base.pathname = base.pathname.replace(/\/+$/, "");

    const normalizedPath = base.pathname.replace(/\/api\/v1$/, "/").replace(/\/api$/, "/");
    base.pathname = normalizedPath || "/";

    return base.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function isProblem(value: unknown): value is ApiProblem {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ApiProblem>;
  return (
    typeof candidate.status === "number" &&
    typeof candidate.code === "string" &&
    typeof candidate.detail === "string" &&
    typeof candidate.requestId === "string"
  );
}

async function readProblem(response: Response): Promise<ApiProblem | undefined> {
  if (!response.headers.get("content-type")?.includes("application/problem+json")) {
    return undefined;
  }
  try {
    const value: unknown = await response.json();
    return isProblem(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export class HbsApiClient {
  private readonly baseUrl: string | null;
  private readonly fetchImplementation: typeof globalThis.fetch;

  constructor(options: HbsApiClientOptions = {}) {
    this.baseUrl = resolveBaseUrl(options.baseUrl);
    // `window.fetch` can lose its receiver when stored and called later in
    // some browsers. Bind the native implementation once, while keeping
    // injected test implementations untouched.
    this.fetchImplementation = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    options: {
      body?: unknown;
      signal?: AbortSignal;
      accessToken?: string;
      headers?: Record<string, string>;
    } = {},
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new HbsApiError(0, API_BASE_URL_MISSING_ERROR);
    }

    const headers: Record<string, string> = {
      accept: "application/json, application/problem+json",
    };
    Object.assign(headers, options.headers);
    if (options.accessToken) headers["authorization"] = `Bearer ${options.accessToken}`;
    if (options.body !== undefined) headers["content-type"] = "application/json";

    let response: Response;
    try {
      response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
        method,
        credentials: "include",
        headers,
        ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
        ...(options.signal ? { signal: options.signal } : {}),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fetch API failed.";
      throw new HbsApiError(0, message);
    }

    if (!response.ok) {
      const problem = await readProblem(response);
      throw new HbsApiError(
        response.status,
        problem?.detail ?? `HBS HOME API request failed with status ${response.status}.`,
        problem,
      );
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  public get<T>(
    path: string,
    signal?: AbortSignal,
    accessToken?: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>("GET", path, {
      ...(signal ? { signal } : {}),
      ...(accessToken ? { accessToken } : {}),
      ...(headers ? { headers } : {}),
    });
  }

  public post<T>(
    path: string,
    body: unknown,
    accessToken?: string,
    signal?: AbortSignal,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>("POST", path, {
      body,
      ...(accessToken ? { accessToken } : {}),
      ...(signal ? { signal } : {}),
      ...(headers ? { headers } : {}),
    });
  }

  public put<T>(
    path: string,
    body: unknown,
    accessToken?: string,
    signal?: AbortSignal,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>("PUT", path, {
      body,
      ...(accessToken ? { accessToken } : {}),
      ...(signal ? { signal } : {}),
      ...(headers ? { headers } : {}),
    });
  }

  public patch<T>(
    path: string,
    body: unknown,
    accessToken?: string,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("PATCH", path, {
      body,
      ...(accessToken ? { accessToken } : {}),
      ...(signal ? { signal } : {}),
    });
  }

  public delete<T>(path: string, signal?: AbortSignal, accessToken?: string): Promise<T> {
    return this.request<T>("DELETE", path, {
      ...(signal ? { signal } : {}),
      ...(accessToken ? { accessToken } : {}),
    });
  }

  getLiveness(signal?: AbortSignal): Promise<ApiHealth> {
    return this.get<ApiHealth>("/health/live", signal);
  }

  getReadiness(signal?: AbortSignal): Promise<ApiReadiness> {
    return this.get<ApiReadiness>("/health/ready", signal);
  }

  getVersion(signal?: AbortSignal): Promise<ApiVersion> {
    return this.get<ApiVersion>("/api/v1/version", signal);
  }

  getAdminSession(accessToken: string, signal?: AbortSignal): Promise<ApiAdminSession> {
    return this.get<ApiAdminSession>("/api/v1/admin/session", signal, accessToken);
  }

  listAuditEvents(accessToken: string, limit = 50, signal?: AbortSignal): Promise<ApiAuditList> {
    return this.get<ApiAuditList>(
      `/api/v1/admin/audit-events?limit=${String(limit)}`,
      signal,
      accessToken,
    );
  }
}
