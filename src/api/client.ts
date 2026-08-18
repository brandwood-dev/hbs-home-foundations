import type { components } from "@/api/generated/hbs-home-api";

export type ApiProblem = components["schemas"]["ProblemDetail"];
export type ApiHealth = components["schemas"]["HealthResponse"];
export type ApiReadiness = components["schemas"]["ReadinessResponse"];
export type ApiVersion = components["schemas"]["VersionResponse"];

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

function resolveBaseUrl(explicit?: string): string {
  const configured = explicit?.trim() || import.meta.env.VITE_HBS_API_BASE_URL?.trim();
  if (!configured) {
    if (import.meta.env.PROD) {
      throw new Error("VITE_HBS_API_BASE_URL is required in production.");
    }
    return "http://localhost:3000";
  }
  return new URL(configured).toString().replace(/\/$/, "");
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
  private readonly baseUrl: string;
  private readonly fetchImplementation: typeof globalThis.fetch;

  constructor(options: HbsApiClientOptions = {}) {
    this.baseUrl = resolveBaseUrl(options.baseUrl);
    this.fetchImplementation = options.fetch ?? globalThis.fetch;
  }

  private async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
      method: "GET",
      credentials: "include",
      headers: { accept: "application/json, application/problem+json" },
      ...(signal ? { signal } : {}),
    });

    if (!response.ok) {
      const problem = await readProblem(response);
      throw new HbsApiError(
        response.status,
        problem?.detail ?? `HBS HOME API request failed with status ${response.status}.`,
        problem,
      );
    }

    return (await response.json()) as T;
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
}
