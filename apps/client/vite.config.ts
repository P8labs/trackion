import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const host = process.env.TAURI_DEV_HOST;

const getAutoWebVersion = () => {
  const envVersion = process.env.VITE_WEB_VERSION?.trim();
  if (envVersion) {
    return envVersion;
  }

  const webPackageFile = fileURLToPath(
    new URL("./package.json", import.meta.url),
  );
  try {
    const packageJson = JSON.parse(readFileSync(webPackageFile, "utf8")) as {
      version?: string;
    };
    const version = packageJson.version?.trim() || "";
    if (/^\d+\.\d+\.\d+$/.test(version)) {
      return version;
    }
  } catch {
    // Fall through to default.
  }

  return "0.0.0";
};

const webVersion = getAutoWebVersion();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  define: {
    "import.meta.env.VITE_WEB_VERSION": JSON.stringify(webVersion),
  },

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  resolve: {
    tsconfigPaths: true,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("@tanstack/react-query")) {
            return "react-query";
          }

          if (
            id.includes("react-router") ||
            id.includes("react-dom") ||
            id.includes("react/")
          ) {
            return "react-core";
          }

          if (id.includes("lucide-react") || id.includes("@icons-pack")) {
            return "icons";
          }

          if (id.includes("highlight.js")) {
            return "highlight";
          }

          if (id.includes("rrweb")) {
            return "rrweb";
          }

          if (id.includes("tailwindcss")) {
            return "tailwindcss";
          }

          if (id.includes("@mantine/core") || id.includes("@mantine/")) {
            return "mantine";
          }

          if (id.includes("shiki")) {
            return "shiki";
          }

          return "vendor";
        },
      },
    },
  },
});
