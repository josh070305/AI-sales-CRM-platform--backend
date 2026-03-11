import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { registerMessageSocket } from '../controllers/messageController.js';
import { registerSocketEmitter } from '../services/notificationService.js';
import { verifyAccessToken } from '../utils/tokens.js';

export function initializeSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Socket authentication token missing'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('_id name role');
      if (!user) {
        return next(new Error('Socket authentication failed'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    socket.join(`user:${userId}`);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeenAt: new Date() });
    io.emit('presence:update', { userId, isOnline: true });

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('message:typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('message:typing', {
        conversationId,
        userId,
        isTyping,
      });
    });

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeenAt: new Date() });
      io.emit('presence:update', { userId, isOnline: false });
    });
  });

  registerSocketEmitter(io);
  registerMessageSocket(io);

  return io;
}
