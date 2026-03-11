import { StatusCodes } from 'http-status-codes';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return sendResponse(res, StatusCodes.OK, 'Users fetched successfully', users);
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  return sendResponse(res, StatusCodes.OK, 'User fetched successfully', user);
});
