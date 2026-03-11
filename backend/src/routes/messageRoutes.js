import { Router } from 'express';
import {
  createMessage,
  getConversations,
  getMessages,
  markConversationAsRead,
} from '../controllers/messageController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createMessageValidator } from '../validators/messageValidators.js';

export const messageRoutes = Router();

messageRoutes.use(requireAuth);
messageRoutes.get('/conversations', getConversations);
messageRoutes.get('/conversations/:conversationId', getMessages);
messageRoutes.post('/', createMessageValidator, validate, createMessage);
messageRoutes.patch('/conversations/:conversationId/read', markConversationAsRead);
