import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

import { handleFTPProxy } from './server/ftpProxy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ftp-proxy',
      configureServer(server) {
        server.middlewares.use('/api/ftp', (req, res, next) => {
          handleFTPProxy(req, res, next).catch(next);
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-jszip': ['jszip'],
          // 听书神经网络引擎(onnxruntime-web 等重依赖),仅在选用时随引擎动态加载
          'vendor-tts': ['@mintplex-labs/piper-tts-web', 'onnxruntime-web'],
        },
      },
    },
  },
});
