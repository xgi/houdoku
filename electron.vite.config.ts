import { resolve } from 'path';
import { externalizeDepsPlugin, bytecodePlugin } from 'electron-vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default {
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
      },
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'fs', 'constants', 'stream', 'util', 'zlib'],
      }),
    ],
  },
};
