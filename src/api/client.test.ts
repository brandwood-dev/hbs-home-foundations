import { describe, expect, it, vi } from "vitest";
import { HbsApiClient, HbsApiError } from "./client";

describe("HbsApiClient", () => {
  it("reads the API release endpoint with the expected request contract", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        apiVersion: "v1",
        contractVersion: "1.0.0",
        release: "0.1.0-staging",
        gitSha: "abc123",
      }),
    );
    const client = new HbsApiClient({
      baseUrl: "https://api-preview.hbs-home.com/",
      fetch: fetchImplementation,
    });

    await expect(client.getVersion()).resolves.toMatchObject({ contractVersion: "1.0.0" });
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api-preview.hbs-home.com/api/v1/version",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("exposes an RFC 9457 problem response", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        {
          type: "https://api.hbs-home.com/problems/not-found",
          title: "Not Found",
          status: 404,
          code: "route_not_found",
          detail: "The requested route does not exist.",
          requestId: "req-123",
        },
        { status: 404, headers: { "content-type": "application/problem+json" } },
      ),
    );
    const client = new HbsApiClient({
      baseUrl: "https://api.example.test",
      fetch: fetchImplementation,
    });

    const error = await client.getLiveness().catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(HbsApiError);
    expect(error).toMatchObject({
      status: 404,
      problem: { code: "route_not_found", requestId: "req-123" },
    });
  });
});
