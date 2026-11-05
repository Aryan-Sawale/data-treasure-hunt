import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';

const logger = createLogger();
const originalLoggerError = logger.error;
logger.error = (msg, options) => {
  // Filter out harmless TCP ECONNRESET logs caused by browser tab reloads/closes
  if (typeof msg === 'string' && (msg.includes('ws proxy socket error') || (msg.includes('ECONNRESET') && msg.includes('ws proxy')))) {
    return;
  }
  originalLoggerError(msg, options);
};

export default defineConfig({
  customLogger: logger,
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            // Gracefully catch ECONNRESET / ECONNREFUSED when backend is offline/restarting
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ offline: true, error: 'Backend server unavailable' }));
            }
          });
        }
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ online: false }));
            }
          });
        }
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, _socket) => {
            // Absorb WebSocket connection resets when backend is not listening
          });
        }
      }
    }
  }
});
