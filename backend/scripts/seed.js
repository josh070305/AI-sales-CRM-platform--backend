import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/db.js';
import { CompanySettings } from '../src/models/CompanySettings.js';
import { Conversation } from '../src/models/Conversation.js';
import { Deal } from '../src/models/Deal.js';
import { Lead } from '../src/models/Lead.js';
import { Message } from '../src/models/Message.js';
import { Notification } from '../src/models/Notification.js';
import { User } from '../src/models/User.js';

async function seed() {
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Deal.deleteMany({}),
    Notification.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    CompanySettings.deleteMany({}),
  ]);

  const [admin, manager, executive] = await User.create([
    {
      name: 'Alicia Reyes',
      email: 'admin@aicrm.com',
      password: 'Password123!',
      role: 'admin',
      phoneNumber: '+15550000001',
      smsAlertsEnabled: false,
      title: 'Platform Admin',
    },
    {
      name: 'Marcus Lane',
      email: 'manager@aicrm.com',
      password: 'Password123!',
      role: 'sales_manager',
      phoneNumber: '+15550000002',
      title: 'Sales Manager',
    },
    {
      name: 'Nina Brooks',
      email: 'rep@aicrm.com',
      password: 'Password123!',
      role: 'sales_executive',
      phoneNumber: '+15550000003',
      title: 'Account Executive',
    },
  ]);

  const leads = await Lead.create([
    {
      fullName: 'Jordan Carter',
      email: 'jordan@northstarhealth.com',
      phoneNumber: '+14155550123',
      company: 'Northstar Health',
      source: 'LinkedIn',
      industry: 'Healthcare',
      estimatedValue: 42000,
      status: 'qualified',
      priority: 'high',
      assignedTo: executive._id,
      owner: manager._id,
      tags: ['enterprise', 'demo-ready'],
      nextFollowUpAt: new Date(Date.now() + 86400000),
    },
    {
      fullName: 'Emily Stone',
      email: 'emily@orbitlogistics.io',
      phoneNumber: '+14155550777',
      company: 'Orbit Logistics',
      source: 'Referral',
      industry: 'Logistics',
      estimatedValue: 18000,
      status: 'contacted',
      priority: 'medium',
      assignedTo: executive._id,
      owner: manager._id,
      tags: ['mid-market'],
    },
  ]);

  await Deal.create([
    {
      title: 'Northstar Health annual CRM rollout',
      lead: leads[0]._id,
      customerName: 'Northstar Health',
      assignedTo: executive._id,
      owner: manager._id,
      stage: 'Proposal Sent',
      estimatedAmount: 42000,
      expectedCloseDate: new Date(Date.now() + 7 * 86400000),
      probability: 75,
      stageLogs: [
        { stage: 'New', changedBy: manager._id, note: 'Created from seed data' },
        { stage: 'Qualified', changedBy: executive._id, note: 'Budget confirmed' },
        { stage: 'Proposal Sent', changedBy: executive._id, note: 'Proposal shared' },
      ],
    },
  ]);

  await Notification.create([
    {
      user: executive._id,
      type: 'lead_assigned',
      title: 'New lead assigned',
      message: 'Jordan Carter from Northstar Health was assigned to you',
      link: `/app/leads/${leads[0]._id}`,
    },
    {
      user: manager._id,
      type: 'announcement',
      title: 'Weekly forecast review',
      message: 'Pipeline review starts at 4 PM today',
      link: '/app/analytics',
    },
  ]);

  const conversation = await Conversation.create({
    participants: [manager._id, executive._id],
    unreadCounts: {
      [manager._id]: 0,
      [executive._id]: 1,
    },
  });

  const message = await Message.create({
    conversation: conversation._id,
    sender: manager._id,
    body: 'Jordan is warm. Please push for a demo timeline before Friday.',
    deliveredAt: new Date(),
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  await CompanySettings.create({
    companyName: 'Apex Revenue Labs',
    brandColor: '#12906e',
    defaultCurrency: 'USD',
    timezone: 'America/New_York',
  });

  console.log('Seed complete.');
  console.log('Admin: admin@aicrm.com / Password123!');
  console.log('Manager: manager@aicrm.com / Password123!');
  console.log('Executive: rep@aicrm.com / Password123!');

  await mongoose.connection.close();
}

seed();
