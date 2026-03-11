import { v4 as uuidv4 } from 'uuid';
import { env, isProduction } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

export async function issueAuthTokens(user, meta = {}) {
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    userAgent: meta.userAgent || 'unknown',
    ipAddress: meta.ipAddress || 'unknown',
    expiresAt,
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(token, meta = {}) {
  const stored = await RefreshToken.findOne({ token });
  if (!stored) return null;

  const decoded = verifyRefreshToken(token);
  await RefreshToken.deleteOne({ _id: stored._id });

  return issueAuthTokens({ _id: decoded.userId, role: decoded.role }, meta);
}

export async function revokeRefreshToken(token) {
  await RefreshToken.deleteOne({ token });
}

export function attachAuthCookies(res, accessToken, refreshToken) {
  const cookieOptions = {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

export function createResetToken() {
  return uuidv4().replace(/-/g, '');
}
