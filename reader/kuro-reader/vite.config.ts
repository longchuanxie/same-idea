import path from 'path';

import react from '@vitejs/plugin-react';
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
});
