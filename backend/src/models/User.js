import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true, default: 'Acme Sales' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: USER_ROLES, default: 'sales_executive', index: true },
    avatar: String,
    phoneNumber: String,
    title: String,
    department: String,
    smsAlertsEnabled: { type: Boolean, default: false },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    lastSeenAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
