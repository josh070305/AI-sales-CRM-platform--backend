import { Activity } from '../models/Activity.js';
import { Deal } from '../models/Deal.js';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';

export async function getDashboardMetrics(user) {
  const scope = user.role === 'sales_executive' ? { assignedTo: user._id } : {};
  const leadScope = user.role === 'sales_executive' ? { assignedTo: user._id } : {};

  const [totalLeads, activeDeals, wonDeals, lostDeals, overdueFollowUps, assignedTasks] = await Promise.all([
    Lead.countDocuments(leadScope),
    Deal.countDocuments({ ...scope, stage: { $nin: ['Won', 'Lost'] } }),
    Deal.countDocuments({ ...scope, stage: 'Won' }),
    Deal.countDocuments({ ...scope, stage: 'Lost' }),
    Activity.countDocuments({ author: user._id, type: 'follow_up', dueAt: { $lt: new Date() } }),
    Activity.countDocuments({ author: user._id, dueAt: { $gte: new Date() } }),
  ]);

  const revenueForecastResult = await Deal.aggregate([
    { $match: scope },
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ['$estimatedAmount', { $divide: ['$probability', 100] }] } },
      },
    },
  ]);

  const conversionResult = await Lead.aggregate([
    { $match: leadScope },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        converted: {
          $sum: {
            $cond: [{ $ifNull: ['$convertedToDeal', false] }, 1, 0],
          },
        },
      },
    },
  ]);

  return {
    totalLeads,
    activeDeals,
    wonDeals,
    lostDeals,
    overdueFollowUps,
    revenueForecast: revenueForecastResult[0]?.total || 0,
    conversionRate: conversionResult[0]?.total
      ? Math.round((conversionResult[0].converted / conversionResult[0].total) * 100)
      : 0,
    assignedTasks,
  };
}

export async function getAnalyticsOverview() {
  const [leadsBySource, leadsByStatus, dealsByStage, topSalesReps, monthlyConversions] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$source', value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
    Lead.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }]),
    Deal.aggregate([{ $group: { _id: '$stage', value: { $sum: 1 } } }]),
    Deal.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          deals: { $sum: 1 },
          revenue: { $sum: '$estimatedAmount' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]),
    Deal.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          created: { $sum: 1 },
          won: {
            $sum: {
              $cond: [{ $eq: ['$stage', 'Won'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const overdueFollowUpTrends = await Activity.aggregate([
    { $match: { type: 'follow_up', dueAt: { $exists: true } } },
    {
      $group: {
        _id: {
          year: { $year: '$dueAt' },
          month: { $month: '$dueAt' },
        },
        overdue: {
          $sum: {
            $cond: [{ $lt: ['$dueAt', new Date()] }, 1, 0],
          },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return {
    leadsBySource: leadsBySource.map((item) => ({ name: item._id || 'Unknown', value: item.value })),
    leadsByStatus: leadsByStatus.map((item) => ({ name: item._id || 'Unknown', value: item.value })),
    dealsByStage: dealsByStage.map((item) => ({ name: item._id || 'Unknown', value: item.value })),
    topSalesReps: topSalesReps.map((item) => ({
      name: item.user?.[0]?.name || 'Unassigned',
      deals: item.deals,
      revenue: item.revenue,
    })),
    monthlyConversions: monthlyConversions.map((item) => ({
      name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      created: item.created,
      won: item.won,
    })),
    overdueFollowUpTrends: overdueFollowUpTrends.map((item) => ({
      name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      overdue: item.overdue,
    })),
  };
}

export async function getTeamPerformance() {
  return User.aggregate([
    {
      $lookup: {
        from: 'deals',
        localField: '_id',
        foreignField: 'assignedTo',
        as: 'deals',
      },
    },
    {
      $lookup: {
        from: 'leads',
        localField: '_id',
        foreignField: 'assignedTo',
        as: 'leads',
      },
    },
    {
      $project: {
        name: 1,
        role: 1,
        dealsCount: { $size: '$deals' },
        leadsCount: { $size: '$leads' },
        wonDeals: {
          $size: {
            $filter: {
              input: '$deals',
              as: 'deal',
              cond: { $eq: ['$$deal.stage', 'Won'] },
            },
          },
        },
        pipelineRevenue: { $sum: '$deals.estimatedAmount' },
      },
    },
  ]);
}
