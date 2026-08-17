/** Clé d'idempotence : la même soumission ne crée jamais deux commandes. */

function randomPart(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createIdempotencyKey(): string {
  const cryptoApi = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
  return `${Date.now().toString(36)}-${randomPart()}-${randomPart()}`;
}
