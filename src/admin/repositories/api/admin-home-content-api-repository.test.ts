import { describe, expect, it, vi } from "vitest";
import type { components } from "@/api/generated/hbs-home-api";
import { HbsApiClient } from "@/api";
import { ApiAdminHomeContentRepository } from "./admin-home-content-api-repository";

const revision = {
  id: "11111111-1111-4111-8111-111111111111",
  status: "draft",
  version: 2,
  publishedAt: null,
  updatedAt: "2026-08-23T12:00:00.000Z",
  sections: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      sectionKey: "hero",
      sortOrder: 0,
      isEnabled: true,
      payload: { title: "Test" },
      media: null,
      mobileMedia: null,
      hotspots: [],
    },
  ],
} as const;

const content = {
  draft: revision,
  published: null,
} as unknown as components["schemas"]["AdminHomeContent"];

describe("ApiAdminHomeContentRepository", () => {
  it("loads the draft and maps sections", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(Response.json(content));
    const repository = new ApiAdminHomeContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
      async () => "token",
    );

    await expect(repository.get()).resolves.toMatchObject({
      draft: { version: 2, sections: [{ sectionKey: "hero", payload: { title: "Test" } }] },
      published: null,
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/content/home",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ authorization: "Bearer token" }),
      }),
    );
  });

  it("sends the optimistic-lock version when saving a draft", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(Response.json(revision));
    const repository = new ApiAdminHomeContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
      async () => "token",
    );

    await repository.update({
      expectedVersion: 1,
      sections: [
        {
          sectionKey: "hero",
          sortOrder: 0,
          payload: { title: "Test" },
          mediaAssetId: null,
          mobileMediaAssetId: null,
          hotspots: [],
        },
      ],
    });

    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/admin/content/home",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          sections: [
            {
              sectionKey: "hero",
              sortOrder: 0,
              payload: { title: "Test" },
              mediaAssetId: null,
              mobileMediaAssetId: null,
              hotspots: [],
            },
          ],
          expectedVersion: 1,
        }),
      }),
    );
  });

  it("uses the section endpoint for scoped reads and writes", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(content))
      .mockResolvedValueOnce(Response.json(revision));
    const repository = new ApiAdminHomeContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
      async () => "token",
    );

    await repository.get("hero");
    await repository.updateSection("hero", {
      sectionKey: "hero",
      sortOrder: 0,
      isEnabled: true,
      payload: { title: "Updated" },
      expectedVersion: 2,
    });

    expect(fetchImplementation).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/api/v1/admin/content/home/hero",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchImplementation).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/api/v1/admin/content/home/hero",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          sectionKey: "hero",
          sortOrder: 0,
          isEnabled: true,
          payload: { title: "Updated" },
          expectedVersion: 2,
        }),
      }),
    );
  });
});
