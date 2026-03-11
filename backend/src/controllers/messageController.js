import { StatusCodes } from 'http-status-codes';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { createNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

let ioRef = null;

export function registerMessageSocket(io) {
  ioRef = io;
}

async function findOrCreateConversation(userId, recipientId) {
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, recipientId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, recipientId],
      unreadCounts: {
        [userId]: 0,
        [recipientId]: 0,
      },
    });
  }

  return conversation;
}

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name email role isOnline avatar')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name' },
    })
    .sort({ updatedAt: -1 });

  return sendResponse(res, StatusCodes.OK, 'Conversations fetched successfully', conversations);
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversation: req.params.conversationId })
    .populate('sender', 'name email role avatar')
    .sort({ createdAt: 1 });

  return sendResponse(res, StatusCodes.OK, 'Messages fetched successfully', messages);
});

export const createMessage = asyncHandler(async (req, res) => {
  const conversation = await findOrCreateConversation(req.user._id, req.body.recipientId);
  const unreadCounts = Object.fromEntries(conversation.unreadCounts);
  unreadCounts[req.body.recipientId] = (unreadCounts[req.body.recipientId] || 0) + 1;

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    body: req.body.body,
    deliveredAt: new Date(),
  });

  conversation.lastMessage = message._id;
  conversation.unreadCounts = unreadCounts;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id).populate('sender', 'name email role avatar');

  if (ioRef) {
    ioRef.to(`conversation:${conversation._id}`).emit('message:new', populatedMessage);
    ioRef.to(`user:${req.body.recipientId}`).emit('conversation:updated', {
      conversationId: conversation._id,
      unreadCount: unreadCounts[req.body.recipientId],
    });
  }

  await createNotification({
    user: req.body.recipientId,
    type: 'message',
    title: 'New message',
    message: `${req.user.name} sent you a message`,
    link: '/app/messages',
    metadata: { conversationId: conversation._id },
  });

  return sendResponse(res, StatusCodes.CREATED, 'Message sent successfully', {
    conversationId: conversation._id,
    message: populatedMessage,
  });
});

export const markConversationAsRead = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  const unreadCounts = Object.fromEntries(conversation.unreadCounts);
  unreadCounts[req.user._id.toString()] = 0;
  conversation.unreadCounts = unreadCounts;
  await conversation.save();

  return sendResponse(res, StatusCodes.OK, 'Conversation marked as read', conversation);
});
