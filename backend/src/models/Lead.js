import mongoose from 'mongoose';
import { LEAD_PRIORITIES, LEAD_STATUSES } from '../utils/constants.js';

const leadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phoneNumber: { type: String, trim: true, index: true },
    company: { type: String, trim: true, index: true },
    source: { type: String, trim: true, index: true },
    industry: { type: String, trim: true, index: true },
    estimatedValue: { type: Number, default: 0 },
    status: { type: String, enum: LEAD_STATUSES, default: 'new', index: true },
    priority: { type: String, enum: LEAD_PRIORITIES, default: 'medium', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    notes: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    convertedToDeal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    lastContactedAt: Date,
    nextFollowUpAt: Date,
  },
  { timestamps: true }
);

leadSchema.index({ fullName: 'text', email: 'text', company: 'text', phoneNumber: 'text' });

export const Lead = mongoose.model('Lead', leadSchema);
