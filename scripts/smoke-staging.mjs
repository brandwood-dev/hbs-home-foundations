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
// version propagates. Use a fresh query key for every attempt and wait for the
// exact release instead of failing on that short propagation window.
const maxAttempts = Number.parseInt(process.env.SMOKE_MAX_ATTEMPTS ?? "12", 10);
const retryDelayMs = Number.parseInt(process.env.SMOKE_RETRY_DELAY_MS ?? "5000", 10);
let lastRelease = null;
let successResult;

for (let attempt = 1; attempt <= Math.max(1, maxAttempts); attempt += 1) {
  const smokeUrl = new URL("/", baseUrl);
  smokeUrl.searchParams.set("_release", expectedSha || "local");
  smokeUrl.searchParams.set("_attempt", String(attempt));
  const response = await fetch(smokeUrl, { headers, redirect: "follow", cache: "no-store" });
  const release = response.headers.get("x-hbs-release");
  const robots = response.headers.get("x-robots-tag");
  lastRelease = release;

  if (!response.ok) {
    throw new Error(`Frontend smoke failed with HTTP ${response.status}.`);
  }
  if (robots !== "noindex, nofollow") {
    throw new Error(`Expected staging noindex header, received ${robots ?? "none"}.`);
  }
  if (!expectedSha || release === expectedSha) {
    successResult = { ok: true, status: response.status, release, robots, attempt };
    break;
  }
  if (attempt < Math.max(1, maxAttempts)) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, retryDelayMs)));
  }
}

if (successResult) {
  console.log(JSON.stringify(successResult));
} else {
  throw new Error(`Expected release ${expectedSha}, received ${lastRelease ?? "none"}.`);
}
