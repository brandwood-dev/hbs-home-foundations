import { describe, expect, it, vi } from "vitest";
import { HbsApiClient, HbsApiError } from "./client";

describe("HbsApiClient", () => {
  it("reads the API release endpoint with the expected request contract", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        apiVersion: "v1",
        contractVersion: "1.1.0",
        release: "0.1.0-staging",
        gitSha: "abc123",
      }),
    );
    const client = new HbsApiClient({
      baseUrl: "https://api-preview.hbs-home.com/",
      fetch: fetchImplementation,
    });

    await expect(client.getVersion()).resolves.toMatchObject({ contractVersion: "1.1.0" });
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api-preview.hbs-home.com/api/v1/version",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("sends the Supabase access token only to protected Admin endpoints", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        user: { id: "11111111-1111-4111-8111-111111111111", email: "admin@example.com" },
        roles: ["super_admin"],
        permissions: ["admin.session_read"],
        assuranceLevel: "aal2",
        mfaRequired: false,
      }),
    );
    const client = new HbsApiClient({
      baseUrl: "https://api.example.test",
      fetch: fetchImplementation,
    });

    await client.getAdminSession("secret-access-token");
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/session",
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer secret-access-token" }),
      }),
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

  it("includes validation paths in contract errors", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        {
          type: "https://api.hbs-home.com/problems/validation-error",
          title: "Validation failed",
          status: 400,
          code: "VALIDATION_ERROR",
          detail: "The request does not match the expected contract.",
          instance: "/api/v1/admin/content/articles",
          requestId: "req-validation",
          errors: [{ path: "/slug", message: "must match pattern", keyword: "pattern" }],
        },
        { status: 400, headers: { "content-type": "application/problem+json" } },
      ),
    );
    const client = new HbsApiClient({
      baseUrl: "https://api.example.test",
      fetch: fetchImplementation,
    });

    await expect(client.post("/api/v1/admin/content/articles", {}, "token")).rejects.toThrow(
      "The request does not match the expected contract. /slug: must match pattern",
    );
  });

  it("serializes authenticated catalog mutations without losing the bearer token", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ id: "cat-1", slug: "rideaux", name: "Rideaux" }));
    const client = new HbsApiClient({
      baseUrl: "https://api.example.test",
      fetch: fetchImplementation,
    });

    await client.post("/api/v1/admin/categories", { slug: "rideaux", name: "Rideaux" }, "token");

    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/categories",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ slug: "rideaux", name: "Rideaux" }),
        headers: expect.objectContaining({
          authorization: "Bearer token",
          "content-type": "application/json",
        }),
      }),
    );
  });

  it("sends category image uploads as authenticated binary payloads", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        mediaAssetId: "44444444-4444-4444-8444-444444444444",
        storagePath: "catalog/categories/test.webp",
        publicUrl: "https://cdn.example.test/catalog/categories/test.webp",
        mimeType: "image/webp",
        width: 120,
        height: 80,
      }),
    );
    const client = new HbsApiClient({
      baseUrl: "https://api.example.test",
      fetch: fetchImplementation,
    });
    const file = new Blob(["fake-image"], { type: "image/png" });

    await client.postFile("/api/v1/admin/categories/image", file, "token", {
      "content-type": file.type,
      "x-image-name": "Rideaux",
    });

    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/categories/image",
      expect.objectContaining({
        method: "POST",
        body: file,
        headers: expect.objectContaining({
          authorization: "Bearer token",
          "content-type": "image/png",
          "x-image-name": "Rideaux",
        }),
      }),
    );
  });

  it("serializes authenticated homepage draft updates as PUT", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ id: "revision-1", status: "draft", version: 2 }));
    const client = new HbsApiClient({
      baseUrl: "https://api.example.test",
      fetch: fetchImplementation,
    });

    const body = { sections: [], expectedVersion: 1 };
    await client.put("/api/v1/admin/content/home", body, "token");

    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/content/home",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(body),
        headers: expect.objectContaining({ authorization: "Bearer token" }),
      }),
    );
  });
});
