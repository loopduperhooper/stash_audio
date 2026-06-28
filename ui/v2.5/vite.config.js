import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import tsconfigPaths from "vite-tsconfig-paths";
import viteCompression from "vite-plugin-compression";

const nolegacy = process.env.VITE_APP_NOLEGACY === "true";
const sourcemap = process.env.VITE_APP_SOURCEMAPS === "true";

// https://vitejs.dev/config/
export default defineConfig(() => {
  let plugins = [
    react({
      babel: {
        compact: true,
      },
    }),
    tsconfigPaths(),
    viteCompression({
      algorithm: "gzip",
      deleteOriginFile: true,
      threshold: 0,
      filter: /\.(js|json|css|svg|md)$/i,
    }),
  ];

  if (!nolegacy) {
    plugins = [...plugins, legacy()];
  }

  return {
    base: "",
    build: {
      outDir: "build",
      sourcemap: sourcemap,
      reportCompressedSize: false,
    },
    optimizeDeps: {
      entries: "src/index.tsx",
    },
    server: {
      port: 3000,
      cors: false,
      proxy: {
        "/graphql": "http://localhost:9998",
        "/login": "http://localhost:9998",
        "/logout": "http://localhost:9998",
        "/audio": "http://localhost:9998",
        "/performer": "http://localhost:9998",
        "/studio": "http://localhost:9998",
        "/group": "http://localhost:9998",
        "/tag": "http://localhost:9998",
        "/plugin": "http://localhost:9998",
        "/custom": "http://localhost:9998",
        "/downloads": "http://localhost:9998",
        "/locale": "http://localhost:9998",
        "/customlocales": "http://localhost:9998",
        "/manifest.json": "http://localhost:9998",
      },
    },
    publicDir: "public",
    assetsInclude: ["**/*.md"],
    plugins,
  };
});
