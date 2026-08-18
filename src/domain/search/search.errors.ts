export type SearchErrorCode = "storage_unavailable" | "storage_write_failed" | "query_too_short";

export class SearchError extends Error {
  constructor(
    public readonly code: SearchErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SearchError";
  }
}
