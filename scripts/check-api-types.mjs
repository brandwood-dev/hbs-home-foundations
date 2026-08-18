import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const temporaryDirectory = await mkdtemp(resolve(tmpdir(), "hbs-home-api-types-"));
const temporaryOutput = resolve(temporaryDirectory, "hbs-home-api.d.ts");
const source = resolve(root, "openapi/hbs-home-api.v1.json");
const committed = resolve(root, "src/api/generated/hbs-home-api.d.ts");
const cli = resolve(root, "node_modules/openapi-typescript/bin/cli.js");

try {
  const result = spawnSync(process.execPath, [cli, source, "-o", temporaryOutput], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exitCode = result.status ?? 1;
  } else {
    const [expected, actual] = await Promise.all([
      readFile(committed, "utf8"),
      readFile(temporaryOutput, "utf8"),
    ]);

    if (expected !== actual) {
      console.error("Generated API types are stale. Run `bun run api:types`.");
      process.exitCode = 1;
    } else {
      console.log("Generated API types are up to date.");
    }
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
