const baseUrl = process.env.SMOKE_BASE_URL?.trim();
const expectedSha = process.env.EXPECTED_GIT_SHA?.trim();

if (!baseUrl) {
  throw new Error("SMOKE_BASE_URL is required.");
}

const headers = { accept: "text/html" };
const accessClientId = process.env.CF_ACCESS_CLIENT_ID?.trim();
const accessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET?.trim();
if (accessClientId && accessClientSecret) {
  headers["CF-Access-Client-Id"] = accessClientId;
  headers["CF-Access-Client-Secret"] = accessClientSecret;
}

const response = await fetch(new URL("/", baseUrl), { headers, redirect: "follow" });
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
