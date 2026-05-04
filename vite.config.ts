import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        // 仅开发时生效：DEEPSEEK_API_KEY 放在 .env / .env.local，勿用 VITE_ 前缀，避免打进前端包
        "/api/deepseek": {
          target: "https://api.deepseek.com",
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api\/deepseek/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const key = env.DEEPSEEK_API_KEY;
              if (key) {
                proxyReq.setHeader("Authorization", `Bearer ${key}`);
              }
            });
          },
        },
      },
    },
  };
});
