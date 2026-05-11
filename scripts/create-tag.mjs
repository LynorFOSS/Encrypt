import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function main() {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const version = packageJson.version;
  const { stdout } = await execFileAsync("git", ["rev-parse", "--short", "HEAD"]);
  const sha = stdout.trim();
  const tag = `v${version}-${sha}`;
  process.stdout.write(`${tag}\n`);
}

await main();
