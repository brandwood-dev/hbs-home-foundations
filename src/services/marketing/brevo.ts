type MarketingEnv = {
  BREVO_API_KEY?: string;
  BREVO_NEWSLETTER_LIST_ID?: string;
  BREVO_CLIENTS_LIST_ID?: string;
  BREVO_MESSAGING_LIST_ID?: string;
};

const MARKETING_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function envString(env: unknown, key: keyof MarketingEnv): string {
  if (typeof env !== "object" || env === null) return "";
  const value = (env as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function envListId(env: unknown, key: keyof MarketingEnv): number | null {
  const value = Number.parseInt(envString(env, key), 10);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function brevoContactUpsert(env: unknown, body: Record<string, unknown>): Promise<Response> {
  const apiKey = envString(env, "BREVO_API_KEY");
  if (!apiKey) {
    return jsonResponse(
      { success: false, message: "Le service newsletter n’est pas encore configuré." },
      503,
    );
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Brevo contacts API returned ${response.status}.`);
      return jsonResponse(
        { success: false, message: "Le service newsletter est temporairement indisponible." },
        502,
      );
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Brevo contacts API request failed.", error);
    return jsonResponse(
      { success: false, message: "Le service newsletter est temporairement indisponible." },
      502,
    );
  }
}

export function getMarketingRuntimeEnv(request: Request): unknown {
  const requestWithContext = request as Request & { context?: { env?: unknown } };
  return (
    requestWithContext.context?.env ??
    (globalThis as typeof globalThis & { __env__?: unknown }).__env__ ??
    {}
  );
}

export async function handleMarketingRequest(
  request: Request,
  env: unknown,
): Promise<Response | null> {
  const url = new URL(request.url);
  const isNewsletter = url.pathname === "/api/newsletter/subscriptions";
  const isOrderSync = url.pathname === "/api/newsletter/orders";
  if (!isNewsletter && !isOrderSync) return null;

  if (request.method !== "POST") {
    return jsonResponse({ success: false, message: "Méthode non autorisée." }, 405);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, message: "Requête invalide." }, 400);
  }

  if (isNewsletter) {
    const body = asRecord(payload);
    const email = asTrimmedString(body["email"]).toLowerCase();
    const listId = envListId(env, "BREVO_NEWSLETTER_LIST_ID");
    if (!MARKETING_EMAIL_PATTERN.test(email) || email.length > 254) {
      return jsonResponse(
        { success: false, message: "Veuillez saisir une adresse e-mail valide." },
        400,
      );
    }
    if (!listId) {
      return jsonResponse(
        { success: false, message: "Le service newsletter n’est pas encore configuré." },
        503,
      );
    }

    const result = await brevoContactUpsert(env, {
      email,
      listIds: [listId],
      updateEnabled: true,
    });
    if (!result.ok) return result;
    return jsonResponse({
      success: true,
      message: "Merci ! Votre inscription est bien enregistrée.",
    });
  }

  const body = asRecord(payload);
  const customer = asRecord(body["customer"]);
  const orderNumber = asTrimmedString(body["orderNumber"]);
  const email = asTrimmedString(customer["email"]).toLowerCase();
  const phone = asTrimmedString(customer["phone"]);
  const firstName = asTrimmedString(customer["firstName"]);
  const lastName = asTrimmedString(customer["lastName"]);
  const emailMarketingOptIn = body["emailMarketingOptIn"] === true;
  const messagingMarketingOptIn = body["messagingMarketingOptIn"] === true;
  const clientsListId = envListId(env, "BREVO_CLIENTS_LIST_ID");
  const messagingListId = envListId(env, "BREVO_MESSAGING_LIST_ID");

  if (!orderNumber || (!email && !phone)) {
    return jsonResponse({ success: true, synced: false });
  }
  if (email && (!MARKETING_EMAIL_PATTERN.test(email) || email.length > 254)) {
    return jsonResponse({ success: false, message: "Adresse e-mail invalide." }, 400);
  }
  if (!clientsListId) {
    return jsonResponse(
      { success: false, message: "La synchronisation clients n’est pas encore configurée." },
      503,
    );
  }

  const listIds = [clientsListId];
  if (emailMarketingOptIn && email) listIds.push(envListId(env, "BREVO_NEWSLETTER_LIST_ID") ?? 0);
  if (messagingMarketingOptIn && phone && messagingListId) listIds.push(messagingListId);
  const attributes: Record<string, string> = {};
  if (firstName) attributes["FIRSTNAME"] = firstName;
  if (lastName) attributes["LASTNAME"] = lastName;
  if (phone) attributes["SMS"] = phone;

  const result = await brevoContactUpsert(env, {
    ...(email ? { email } : {}),
    attributes,
    listIds: listIds.filter((id) => id > 0),
    updateEnabled: true,
  });
  if (!result.ok) return result;
  return jsonResponse({ success: true, synced: true });
}
