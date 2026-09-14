import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // "@/*" -> "./src/*" - the path alias shadcn/ui-style components
      // (see src/components/ui/liquid-metal-hero.jsx and friends) are
      // written to expect, matching the convention used throughout the
      // shadcn/21st.dev ecosystem. Mirrored in jsconfig.json so editors
      // resolve it too (Vite itself only needs this block).
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
