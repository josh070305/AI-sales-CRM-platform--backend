import { StatusCodes } from 'http-status-codes';
import { Notification } from '../models/Notification.js';
import { markAllNotificationsAsRead } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, readAt: { $exists: false } });
  return sendResponse(res, StatusCodes.OK, 'Notifications fetched successfully', { items, unreadCount });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true }
  );

  return sendResponse(res, StatusCodes.OK, 'Notification marked as read', notification);
});

export const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await markAllNotificationsAsRead(req.user._id);
  return sendResponse(res, StatusCodes.OK, 'All notifications marked as read');
});
