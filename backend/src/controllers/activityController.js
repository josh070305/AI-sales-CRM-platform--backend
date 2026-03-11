import { StatusCodes } from 'http-status-codes';
import { Activity } from '../models/Activity.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

export const getActivities = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.leadId) query.lead = req.query.leadId;
  if (req.query.dealId) query.deal = req.query.dealId;

  const activities = await Activity.find(query).populate('author', 'name role').sort({ createdAt: -1 });
  return sendResponse(res, StatusCodes.OK, 'Activities fetched successfully', activities);
});

export const createActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.create({
    ...req.body,
    author: req.user._id,
  });

  return sendResponse(res, StatusCodes.CREATED, 'Activity created successfully', activity);
});
