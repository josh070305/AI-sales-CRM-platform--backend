import { StatusCodes } from 'http-status-codes';
import { Activity } from '../models/Activity.js';
import { aiService } from '../services/aiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

const actionMap = {
  summarize_lead: 'summarizeLeadHistory',
  follow_up_email: 'generateFollowUpEmail',
  follow_up_whatsapp: 'generateWhatsAppFollowUp',
  next_action: 'suggestNextAction',
  meeting_summary: 'generateMeetingSummary',
  score_lead: 'scoreLeadQuality',
  suggest_priority: 'suggestPriority',
};

export const performAiAction = asyncHandler(async (req, res) => {
  const method = actionMap[req.body.action];
  const result = await aiService[method]?.(req.body.context || '');

  if (req.body.saveToActivity && (req.body.leadId || req.body.dealId)) {
    await Activity.create({
      type: 'ai_generated',
      content: result.content,
      lead: req.body.leadId,
      deal: req.body.dealId,
      author: req.user._id,
      metadata: { action: req.body.action },
    });
  }

  return sendResponse(res, StatusCodes.OK, 'AI action completed', result);
});
