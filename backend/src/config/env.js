import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-sales-crm',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

export const isProduction = env.nodeEnv === 'production';
