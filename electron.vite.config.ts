import path from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
      },
    },
  },
  renderer: {
    plugins: [
      nodePolyfills({
        include: ["path", "fs", "constants", "stream", "util", "zlib"],
      }),
    ],
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
      },
    },
  },
});
