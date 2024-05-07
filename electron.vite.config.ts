import path from 'path';
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
    resolve: {
      alias: {
        '@/': path.join(__dirname, 'src/'),
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        '@/': path.join(__dirname, 'src/'),
      },
    },
  },
  renderer: {
    plugins: [
      nodePolyfills({
        include: ['path', 'fs', 'constants', 'stream', 'util', 'zlib'],
      }),
    ],
    resolve: {
      alias: {
        '@/': path.join(__dirname, 'src/'),
      },
    },
  },
});
