import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, isPreview }) => ({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    // Guard against duplicate React / Query copies when a dependency is linked.
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: { port: 8080 },
  plugins: [
    tailwindcss(),
    // src/server.ts wraps TanStack Start's default server entry so that a
    // crash during SSR still renders a friendly 500 page (see src/start.ts).
    tanstackStart({ server: { entry: "server" } }),
    // Nitro packages the SSR server for deployment (and serves it for `vite preview`).
    // Defaults to a Node server in .output/; pass { preset: "..." } for other hosts.
    ...(command === "build" || isPreview ? [nitro()] : []),
    viteReact(),
  ],
}));
