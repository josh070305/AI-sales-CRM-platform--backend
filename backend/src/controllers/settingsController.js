import { StatusCodes } from 'http-status-codes';
import { CompanySettings } from '../models/CompanySettings.js';
import { User } from '../models/User.js';
import { isSmsConfigured } from '../services/smsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

export const getSettings = asyncHandler(async (req, res) => {
  const companySettings = await CompanySettings.findOne();

  return sendResponse(res, StatusCodes.OK, 'Settings fetched successfully', {
    profile: req.user,
    company: companySettings,
    smsAvailable: isSmsConfigured(),
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
  return sendResponse(res, StatusCodes.OK, 'Profile updated successfully', user);
});

export const updateCompanySettings = asyncHandler(async (req, res) => {
  const settings = await CompanySettings.findOneAndUpdate({}, req.body, {
    upsert: true,
    new: true,
  });

  return sendResponse(res, StatusCodes.OK, 'Company settings updated successfully', settings);
});
