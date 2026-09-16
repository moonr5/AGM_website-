import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.DATADOCKED_API_KEY || env.VITE_DATADOCKED_API_KEY || "";

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: "../en/marine-intelligence",
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      proxy: {
        "/api/datadocked": {
          target: "https://datadocked.com/api/vessels_operations",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/datadocked/, ""),
          configure(proxy) {
            proxy.on("proxyReq", (proxyReq) => {
              if (apiKey) proxyReq.setHeader("x-api-key", apiKey);
            });
          },
        },
      },
    },
  };
});
