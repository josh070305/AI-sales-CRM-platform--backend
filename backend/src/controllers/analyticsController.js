import { StatusCodes } from 'http-status-codes';
import { getAnalyticsOverview, getDashboardMetrics, getTeamPerformance } from '../services/analyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const metrics = await getDashboardMetrics(req.user);
  return sendResponse(res, StatusCodes.OK, 'Dashboard metrics fetched successfully', metrics);
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getAnalyticsOverview();
  return sendResponse(res, StatusCodes.OK, 'Analytics fetched successfully', analytics);
});

export const getTeamAnalytics = asyncHandler(async (req, res) => {
  const team = await getTeamPerformance();
  return sendResponse(res, StatusCodes.OK, 'Team analytics fetched successfully', team);
});
