import { describe, expect, it } from "vitest";
import {
  normalizePromoBannerMessages,
  promoBannerPayload,
  readPromoBannerDraftMessages,
} from "./promo-banner";

describe("promo banner payload", () => {
  it("normalizes the legacy payload to one message", () => {
    expect(
      normalizePromoBannerMessages({
        label: "Nouveauté",
        text: "Livraison offerte",
        href: "/promotions",
      }),
    ).toEqual([
      {
        id: "legacy-promo",
        label: "Nouveauté",
        text: "Livraison offerte",
        href: "/promotions",
        isEnabled: true,
        sortOrder: 0,
      },
    ]);
  });

  it("sorts and preserves inactive multi-message rows", () => {
    const messages = normalizePromoBannerMessages({
      messages: [
        { id: "b", text: "B", isEnabled: false, sortOrder: 4 },
        { id: "a", text: "A", isEnabled: true, sortOrder: 1 },
      ],
    });
    expect(messages.map((message) => message.id)).toEqual(["a", "b"]);
    expect(messages.map((message) => message.sortOrder)).toEqual([0, 1]);
    expect(promoBannerPayload(messages)).toMatchObject({
      messages: [
        { id: "a", text: "A", sortOrder: 0 },
        { id: "b", isEnabled: false, sortOrder: 1 },
      ],
    });
  });

  it("keeps an empty row while the Admin editor is typing", () => {
    const messages = readPromoBannerDraftMessages({
      messages: [
        { id: "a", text: "Premier", isEnabled: true, sortOrder: 0 },
        { id: "b", text: "", isEnabled: true, sortOrder: 1 },
      ],
    });

    expect(messages).toHaveLength(2);
    expect(messages[1]).toMatchObject({ id: "b", text: "" });
    expect(normalizePromoBannerMessages({ messages })).toHaveLength(1);
  });
});
