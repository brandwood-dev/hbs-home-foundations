import { describe, expect, it, vi } from "vitest";
import { HbsApiClient } from "@/api/client";
import { ApiContentRepository } from "./ApiContentRepository";

const page = {
  slug: "a-propos",
  title: "À propos",
  body: "Notre histoire.",
  seoTitle: "À propos | HBS HOME",
  seoDescription: "Découvrez HBS HOME.",
  version: 2,
  publishedAt: "2026-08-23T00:00:00.000Z",
  updatedAt: "2026-08-23T00:00:00.000Z",
  blocks: [
    {
      sortOrder: 0,
      blockType: "hero",
      payload: { heading: "Notre histoire" },
      media: null,
    },
  ],
};

describe("ApiContentRepository", () => {
  it("loads a published page without adding a frontend fixture", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(Response.json(page));
    const repository = new ApiContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await expect(repository.getEditorialPage("a-propos")).resolves.toEqual(page);
    expect(fetchImplementation).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/content/pages/a-propos",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("maps an unpublished page to null", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }));
    const repository = new ApiContentRepository(
      new HbsApiClient({ baseUrl: "https://api.example.test", fetch: fetchImplementation }),
    );

    await expect(repository.getEditorialPage("a-propos")).resolves.toBeNull();
  });
});
