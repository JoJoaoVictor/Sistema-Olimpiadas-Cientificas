import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  optimizeDeps: {
    exclude: [
      "@esbuild-plugins/node-globals-polyfill"
    ]
  }
});
