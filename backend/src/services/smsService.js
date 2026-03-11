import twilio from 'twilio';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export function isSmsConfigured() {
  return Boolean(env.twilioAccountSid && env.twilioAuthToken && env.twilioPhoneNumber);
}

export async function sendSmsAlert({ to, body }) {
  if (!isSmsConfigured() || !to) {
    return { delivered: false, reason: 'SMS is not configured' };
  }

  try {
    const client = twilio(env.twilioAccountSid, env.twilioAuthToken);
    const message = await client.messages.create({
      to,
      from: env.twilioPhoneNumber,
      body,
    });

    return { delivered: true, sid: message.sid };
  } catch (error) {
    logger.warn({ err: error, to }, 'SMS delivery failed');
    return { delivered: false, reason: error.message };
  }
}
