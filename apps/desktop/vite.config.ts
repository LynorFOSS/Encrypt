import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      "@encrypt/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@encrypt/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});