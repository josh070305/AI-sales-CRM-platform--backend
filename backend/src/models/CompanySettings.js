import mongoose from 'mongoose';

const companySettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Acme Sales' },
    brandColor: { type: String, default: '#0f766e' },
    allowSmsAlerts: { type: Boolean, default: false },
    timezone: { type: String, default: 'UTC' },
    defaultCurrency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

export const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema);
