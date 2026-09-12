import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: false,
    env: {
      VITE_API_URL: "http://localhost:3000/api/v1",
      VITE_API_MOCK: "true",
      VITE_GOOGLE_CLIENT_ID: "",
    },
  },
});
