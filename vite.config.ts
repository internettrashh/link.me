import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  build: {},
  base: '/',
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
