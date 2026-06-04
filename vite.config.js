import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base 必须与 GitHub Pages 项目站点路径一致：
// https://lcf-work.github.io/public-study/
// The base path must match the GitHub Pages project URL.
export default defineConfig({
  base: "/public-study/",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
