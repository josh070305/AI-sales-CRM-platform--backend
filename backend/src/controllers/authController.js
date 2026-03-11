import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models/User.js';
import {
  attachAuthCookies,
  clearAuthCookies,
  createResetToken,
  issueAuthTokens,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

export const register = asyncHandler(async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return sendResponse(res, StatusCodes.CONFLICT, 'An account already exists with this email');
  }

  const user = await User.create(req.body);
  const tokens = await issueAuthTokens(user, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  attachAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  return sendResponse(res, StatusCodes.CREATED, 'Account created successfully', {
    user: await User.findById(user._id).select('-password'),
    ...tokens,
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await user.comparePassword(req.body.password))) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  user.lastSeenAt = new Date();
  await user.save();

  const tokens = await issueAuthTokens(user, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  attachAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  return sendResponse(res, StatusCodes.OK, 'Login successful', {
    user: await User.findById(user._id).select('-password'),
    ...tokens,
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return sendResponse(res, StatusCodes.OK, 'Current user fetched', req.user);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, 'Refresh token is required');
  }

  let tokens = null;
  try {
    tokens = await rotateRefreshToken(token, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  } catch (error) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, 'Refresh token is invalid');
  }

  if (!tokens) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, 'Refresh token is invalid');
  }

  attachAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return sendResponse(res, StatusCodes.OK, 'Session refreshed', tokens);
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token) {
    await revokeRefreshToken(token);
  }
  clearAuthCookies(res);
  return sendResponse(res, StatusCodes.OK, 'Logged out successfully');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return sendResponse(res, StatusCodes.OK, 'If the account exists, a reset token has been generated', {
      resetTokenPreview: null,
    });
  }

  const resetToken = createResetToken();
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  return sendResponse(res, StatusCodes.OK, 'Password reset token generated', {
    resetTokenPreview: resetToken,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, 'Reset token is invalid or expired');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return sendResponse(res, StatusCodes.OK, 'Password reset successful');
});
