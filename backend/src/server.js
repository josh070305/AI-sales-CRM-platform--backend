import http from 'http';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initializeSocketServer } from './sockets/index.js';

const app = createApp();
const server = http.createServer(app);

initializeSocketServer(server);

connectDatabase().then(() => {
  server.listen(env.port, () => {
    logger.info(`Backend server listening on port ${env.port}`);
  });
});
