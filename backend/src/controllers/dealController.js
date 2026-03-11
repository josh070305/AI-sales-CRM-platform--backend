import { StatusCodes } from 'http-status-codes';
import { Activity } from '../models/Activity.js';
import { Deal } from '../models/Deal.js';
import { createNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

function buildDealScope(user) {
  return user.role === 'sales_executive' ? { assignedTo: user._id } : {};
}

export const getDeals = asyncHandler(async (req, res) => {
  const deals = await Deal.find(buildDealScope(req.user))
    .populate('lead', 'fullName company status')
    .populate('assignedTo owner', 'name role email')
    .sort({ updatedAt: -1 });

  return sendResponse(res, StatusCodes.OK, 'Deals fetched successfully', deals);
});

export const getDealById = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id)
    .populate('lead', 'fullName company email phoneNumber')
    .populate('assignedTo owner', 'name role email');
  const activities = await Activity.find({ deal: req.params.id }).populate('author', 'name role').sort({ createdAt: -1 });

  return sendResponse(res, StatusCodes.OK, 'Deal fetched successfully', { deal, activities });
});

export const createDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.create({
    ...req.body,
    owner: req.user._id,
    stageLogs: [{ stage: 'New', changedBy: req.user._id, note: 'Deal created' }],
  });

  return sendResponse(res, StatusCodes.CREATED, 'Deal created successfully', deal);
});

export const updateDeal = asyncHandler(async (req, res) => {
  const currentDeal = await Deal.findById(req.params.id);
  const { stageNote, ...rest } = req.body;
  const updates = { $set: rest };

  if (req.body.stage && req.body.stage !== currentDeal.stage) {
    updates.$push = {
      stageLogs: {
        stage: req.body.stage,
        changedBy: req.user._id,
        note: stageNote || `Moved to ${req.body.stage}`,
      },
    };
  }

  const deal = await Deal.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate('assignedTo', 'name role email')
    .populate('lead', 'fullName company');

  if (req.body.stage && req.body.stage !== currentDeal.stage) {
    await createNotification({
      user: deal.assignedTo._id,
      type: 'deal_changed',
      title: 'Deal stage updated',
      message: `${deal.title} moved to ${req.body.stage}`,
      link: `/app/deals/${deal._id}`,
      metadata: { dealId: deal._id, stage: req.body.stage },
    });
  }

  return sendResponse(res, StatusCodes.OK, 'Deal updated successfully', deal);
});
