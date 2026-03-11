import mongoose from 'mongoose';
import { ACTIVITY_TYPES } from '../utils/constants.js';

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ACTIVITY_TYPES, required: true, index: true },
    content: { type: String, required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', index: true },
    customerName: String,
    dueAt: Date,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const Activity = mongoose.model('Activity', activitySchema);
