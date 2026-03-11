import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { sendSmsAlert } from './smsService.js';

let ioInstance = null;

export function registerSocketEmitter(io) {
  ioInstance = io;
}

export async function createNotification(payload) {
  const notification = await Notification.create(payload);
  const populated = await Notification.findById(notification._id);
  const user = await User.findById(payload.user);

  if (ioInstance) {
    ioInstance.to(`user:${payload.user}`).emit('notification:new', populated);
  }

  if (
    user?.phoneNumber &&
    user?.smsAlertsEnabled &&
    ['lead_assigned', 'follow_up_due'].includes(payload.type)
  ) {
    await sendSmsAlert({
      to: user.phoneNumber,
      body: `${payload.title}: ${payload.message}`,
    });
  }

  return populated;
}

export async function markAllNotificationsAsRead(userId) {
  await Notification.updateMany(
    { user: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );

  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification:read_all');
  }
}
