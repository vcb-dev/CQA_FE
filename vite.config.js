import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const beProxy = env.VITE_BE_PROXY || "http://localhost:3001";

  console.log(`[vite] API proxy /api → ${beProxy}`);

  return {
    base: process.env.GITHUB_PAGES === "true" ? "/cqavcb/" : "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: beProxy,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
