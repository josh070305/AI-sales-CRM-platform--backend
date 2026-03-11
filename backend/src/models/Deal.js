import mongoose from 'mongoose';
import { DEAL_STAGES } from '../utils/constants.js';

const stageLogSchema = new mongoose.Schema(
  {
    stage: { type: String, enum: DEAL_STAGES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stage: { type: String, enum: DEAL_STAGES, default: 'New', index: true },
    estimatedAmount: { type: Number, default: 0 },
    expectedCloseDate: Date,
    lostReason: String,
    wonReason: String,
    probability: { type: Number, default: 20, min: 0, max: 100 },
    stageLogs: [stageLogSchema],
  },
  { timestamps: true }
);

export const Deal = mongoose.model('Deal', dealSchema);
