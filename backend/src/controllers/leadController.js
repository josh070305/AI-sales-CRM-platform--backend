import { StatusCodes } from 'http-status-codes';
import { Activity } from '../models/Activity.js';
import { Deal } from '../models/Deal.js';
import { Lead } from '../models/Lead.js';
import { createNotification } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

function buildLeadScope(user) {
  return user.role === 'sales_executive' ? { assignedTo: user._id } : {};
}

export const getLeads = asyncHandler(async (req, res) => {
  const { search, status, priority, source, assignedTo, industry, page = 1, limit = 10 } = req.query;
  const query = { ...buildLeadScope(req.user) };

  if (search) query.$text = { $search: search };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (source) query.source = source;
  if (assignedTo) query.assignedTo = assignedTo;
  if (industry) query.industry = industry;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Lead.find(query)
      .populate('assignedTo', 'name role email')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Lead.countDocuments(query),
  ]);

  return sendResponse(res, StatusCodes.OK, 'Leads fetched successfully', {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate('assignedTo owner', 'name role email');
  const activities = await Activity.find({ lead: req.params.id }).populate('author', 'name role').sort({ createdAt: -1 });
  const deal = await Deal.findOne({ lead: req.params.id }).populate('assignedTo', 'name role');

  return sendResponse(res, StatusCodes.OK, 'Lead fetched successfully', {
    lead,
    activities,
    deal,
  });
});

export const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create({
    ...req.body,
    owner: req.user._id,
    assignedTo: req.body.assignedTo || req.user._id,
  });

  await Activity.create({
    type: 'note',
    content: 'Lead created',
    lead: lead._id,
    author: req.user._id,
  });

  if (lead.assignedTo?.toString() !== req.user._id.toString()) {
    await createNotification({
      user: lead.assignedTo,
      type: 'lead_assigned',
      title: 'New lead assigned',
      message: `${lead.fullName} from ${lead.company} has been assigned to you`,
      link: `/app/leads/${lead._id}`,
      metadata: { leadId: lead._id },
    });
  }

  return sendResponse(res, StatusCodes.CREATED, 'Lead created successfully', lead);
});

export const updateLead = asyncHandler(async (req, res) => {
  const previousLead = await Lead.findById(req.params.id);
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (req.body.assignedTo && previousLead.assignedTo?.toString() !== req.body.assignedTo) {
    await createNotification({
      user: req.body.assignedTo,
      type: 'lead_assigned',
      title: 'Lead assignment updated',
      message: `${lead.fullName} from ${lead.company} has been assigned to you`,
      link: `/app/leads/${lead._id}`,
      metadata: { leadId: lead._id },
    });
  }

  return sendResponse(res, StatusCodes.OK, 'Lead updated successfully', lead);
});

export const deleteLead = asyncHandler(async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  await Activity.deleteMany({ lead: req.params.id });
  return sendResponse(res, StatusCodes.OK, 'Lead deleted successfully');
});

export const convertLeadToDeal = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  const deal = await Deal.create({
    title: `${lead.company} opportunity`,
    lead: lead._id,
    customerName: lead.company,
    assignedTo: lead.assignedTo || req.user._id,
    owner: req.user._id,
    estimatedAmount: lead.estimatedValue,
    expectedCloseDate: req.body.expectedCloseDate,
    stageLogs: [{ stage: 'New', changedBy: req.user._id, note: 'Created from lead conversion' }],
  });

  lead.status = 'converted';
  lead.convertedToDeal = deal._id;
  await lead.save();

  await Activity.create({
    type: 'note',
    content: `Lead converted to deal ${deal.title}`,
    lead: lead._id,
    deal: deal._id,
    author: req.user._id,
  });

  return sendResponse(res, StatusCodes.CREATED, 'Lead converted successfully', deal);
});
