import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { relative, resolve } from "node:path";

function copyStaticTutorials() {
  let config;

  return {
    name: "copy-static-tutorials",
    apply: "build",
    configResolved(resolved) {
      config = resolved;
    },
    closeBundle() {
      const root = config.root;
      const outDir = resolve(root, config.build.outDir);
      const tutorials = [
        {
          from: resolve(root, "content/RL/mc-tutorial"),
          to: resolve(outDir, "RL/mc-tutorial"),
        },
      ];

      for (const item of tutorials) {
        if (!existsSync(item.from)) continue;

        rmSync(item.to, { recursive: true, force: true });
        mkdirSync(resolve(item.to, ".."), { recursive: true });
        cpSync(item.from, item.to, {
          recursive: true,
          filter: (src) => shouldCopyStaticFile(item.from, src),
        });
      }
    },
  };
}

function shouldCopyStaticFile(root, src) {
  const rel = relative(root, src);
  if (!rel) return true;
  const parts = rel.split(/[\\/]/);
  return !parts.includes("__pycache__") && !src.endsWith(".pyc");
}

// base 必须与 GitHub Pages 项目站点路径一致：
// https://lcf-work.github.io/public-study/
// The base path must match the GitHub Pages project URL.
export default defineConfig({
  base: "/public-study/",
  plugins: [react(), copyStaticTutorials()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
