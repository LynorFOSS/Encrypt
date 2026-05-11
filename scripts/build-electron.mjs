import { context } from "esbuild";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const watch = process.argv.includes("--watch");
const desktopRoot = path.resolve("apps/desktop");
const outDir = path.join(desktopRoot, "dist");

await mkdir(outDir, { recursive: true });

const sharedOptions = {
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node20",
  sourcemap: true,
  external: ["electron"],
  define: {
    "process.env.VITE_DEV_SERVER_URL": JSON.stringify(process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173"),
  },
};

const mainContext = await context({
  ...sharedOptions,
  entryPoints: [path.join(desktopRoot, "src/main.ts")],
  outfile: path.join(outDir, "main.cjs"),
});

const preloadContext = await context({
  ...sharedOptions,
  entryPoints: [path.join(desktopRoot, "src/preload.ts")],
  outfile: path.join(outDir, "preload.cjs"),
});

if (watch) {
  await Promise.all([
    mainContext.watch(),
    preloadContext.watch(),
  ]);
  globalThis.console.log("Watching Electron bundles");
} else {
  await Promise.all([
    mainContext.rebuild(),
    preloadContext.rebuild(),
  ]);
  await mainContext.dispose();
  await preloadContext.dispose();
  globalThis.console.log("Electron bundles built");
}
