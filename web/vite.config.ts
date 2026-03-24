import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const webPackageFile = fileURLToPath(
  new URL("./package.json", import.meta.url),
);

const getAutoWebVersion = () => {
  const envVersion = process.env.VITE_WEB_VERSION?.trim();
  if (envVersion) {
    return envVersion;
  }

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
  define: {
    "import.meta.env.VITE_WEB_VERSION": JSON.stringify(webVersion),
    "import.meta.env.VITE_ENABLE_GITHUB_LOGIN":
      process.env.VITE_ENABLE_GITHUB_LOGIN,
    "import.meta.env.VITE_ENABLE_GOOGLE_LOGIN":
      process.env.VITE_ENABLE_GOOGLE_LOGIN,
  },
  server: {
    allowedHosts: ["local.p8labs.qzz.io"],
  },
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
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

          if (id.includes("recharts")) {
            return "charts";
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

          return "vendor";
        },
      },
    },
  },
});
