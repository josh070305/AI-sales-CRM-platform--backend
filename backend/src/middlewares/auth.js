import { StatusCodes } from 'http-status-codes';
import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    const token = req.cookies.accessToken || bearer;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        data: null,
      });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid authentication token',
        data: null,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication failed',
      data: null,
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to perform this action',
        data: null,
      });
    }

    next();
  };
}
