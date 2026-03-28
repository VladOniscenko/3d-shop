import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three-vendor";
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "react-vendor";
          }
          if (id.includes("node_modules/react-router-dom"))
            return "router-vendor";
          if (id.includes("node_modules/lucide-react")) return "icons-vendor";
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5243",
      "/uploads": "http://localhost:5243",
    },
  },
});
