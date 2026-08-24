const baseUrl = process.env.SMOKE_BASE_URL?.trim();
const expectedSha = process.env.EXPECTED_GIT_SHA?.trim();

if (!baseUrl) {
  throw new Error("SMOKE_BASE_URL is required.");
}

const headers = { accept: "text/html" };
headers["cache-control"] = "no-cache, no-store";
headers.pragma = "no-cache";
const accessClientId = process.env.CF_ACCESS_CLIENT_ID?.trim();
const accessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET?.trim();
if (accessClientId && accessClientSecret) {
  headers["CF-Access-Client-Id"] = accessClientId;
  headers["CF-Access-Client-Secret"] = accessClientSecret;
}

// Cloudflare may briefly serve the previous SSR document while a Worker
// version propagates. A release-specific query key makes this verification
// observe the exact deployment rather than an edge-cached HTML response.
const smokeUrl = new URL("/", baseUrl);
smokeUrl.searchParams.set("_release", expectedSha || String(Date.now()));
const response = await fetch(smokeUrl, { headers, redirect: "follow", cache: "no-store" });
const release = response.headers.get("x-hbs-release");
const robots = response.headers.get("x-robots-tag");

if (!response.ok) {
  throw new Error(`Frontend smoke failed with HTTP ${response.status}.`);
}
if (robots !== "noindex, nofollow") {
  throw new Error(`Expected staging noindex header, received ${robots ?? "none"}.`);
}
if (expectedSha && release !== expectedSha) {
  throw new Error(`Expected release ${expectedSha}, received ${release ?? "none"}.`);
}

console.log(JSON.stringify({ ok: true, status: response.status, release, robots }));
