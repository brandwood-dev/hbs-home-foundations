export interface HomePromoBannerMessage {
  id: string;
  label?: string;
  text: string;
  href?: string;
  isEnabled: boolean;
  sortOrder: number;
}

export interface HomePromoBannerContent {
  isEnabled: boolean;
  messages: HomePromoBannerMessage[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalText(value: unknown): string | undefined {
  const text = asText(value);
  return text || undefined;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/**
 * Normalize both the current one-message payload and the multi-message
 * payload used by the Admin editor. Invalid public rows are ignored so a bad
 * legacy row cannot break the public shell.
 */
export function normalizePromoBannerMessages(
  payload: Record<string, unknown>,
  fallback: readonly HomePromoBannerMessage[] = [],
): HomePromoBannerMessage[] {
  const rawMessages = payload["messages"];
  if (Array.isArray(rawMessages)) {
    return rawMessages
      .flatMap((value, index) => {
        const row = asRecord(value);
        if (!row) return [];
        const text = asText(row["text"]);
        if (!text) return [];
        const sortOrder =
          typeof row["sortOrder"] === "number" &&
          Number.isInteger(row["sortOrder"]) &&
          row["sortOrder"] >= 0
            ? row["sortOrder"]
            : index;
        const message: HomePromoBannerMessage = {
          id: asText(row["id"]) || `promo-${index + 1}`,
          text,
          isEnabled: asBoolean(row["isEnabled"], true),
          sortOrder,
        };
        const label = asOptionalText(row["label"]);
        const href = asOptionalText(row["href"]);
        if (label) message.label = label;
        if (href) message.href = href;
        return [message];
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((message, index) => ({ ...message, sortOrder: index }));
  }

  const legacyText = asText(payload["text"]);
  if (legacyText) {
    const message: HomePromoBannerMessage = {
      id: "legacy-promo",
      text: legacyText,
      isEnabled: true,
      sortOrder: 0,
    };
    const label = asOptionalText(payload["label"]);
    const href = asOptionalText(payload["href"]);
    if (label) message.label = label;
    if (href) message.href = href;
    return [message];
  }

  return fallback.map((message, index) => ({ ...message, sortOrder: index }));
}

export function promoBannerPayload(
  messages: readonly HomePromoBannerMessage[],
): Record<string, unknown> {
  return {
    messages: messages.map((message, index) => ({
      id: message.id,
      ...(message.label?.trim() ? { label: message.label.trim() } : {}),
      text: message.text.trim(),
      ...(message.href?.trim() ? { href: message.href.trim() } : {}),
      isEnabled: message.isEnabled,
      sortOrder: index,
    })),
  };
}
