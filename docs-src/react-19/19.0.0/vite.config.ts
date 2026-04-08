import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@stackline/react-google-maps': resolve(__dirname, '../../../src/index.ts'),
      react: resolve(__dirname, 'node_modules/react'),
      'react/jsx-runtime': resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom')
    },
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: '../../../docs/react-19/19.0.0',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wrapperNoKey: resolve(__dirname, 'wrapper-no-key.html'),
        wrapperInvalidKey: resolve(__dirname, 'wrapper-invalid-key.html')
      }
    }
  }
});
