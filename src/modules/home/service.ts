import { mockOffers } from '../../mocks/offers';
import { mockRequests } from '../../mocks/requests';
import { mockDeals } from '../../mocks/deals';
import { mockReviews } from '../../mocks/reviews';
import { mockTrustProfiles } from '../../mocks/trust';
import { HomeData, HomeStats, ActivityItem } from './types';

export async function getHomeData(userId: string): Promise<HomeData> {
  const featuredOffers = mockOffers.slice(0, 3);
  const urgentRequests = mockRequests.filter((r) => r.status === 'open').slice(0, 3);
  const openDeals = mockDeals
    .filter((d) => d.status === 'active' || d.status === 'in_progress')
    .slice(0, 3);

  const stats: HomeStats = {
    offers: {
      total: mockOffers.length,
      active: mockOffers.filter((o) => o.status === 'active').length,
      views: mockOffers.reduce((sum, o) => sum + o.views, 0),
    },
    requests: {
      total: mockRequests.length,
      open: mockRequests.filter((r) => r.status === 'open').length,
    },
    deals: {
      active: mockDeals.filter((d) => d.status === 'active').length,
      pending: mockDeals.filter((d) => d.status === 'pending').length,
      completed: mockDeals.filter((d) => d.status === 'completed').length,
    },
    revenue: {
      total: mockDeals.reduce((sum, d) => sum + d.amount, 0),
      pending: mockDeals
        .filter((d) => d.status === 'pending')
        .reduce((sum, d) => sum + d.amount, 0),
      currency: 'USD',
    },
    trust: {
      score: 92,
      level: 'gold',
    },
  };

  const aiSuggestions = [
    {
      type: 'opportunity',
      title: 'Complete Your Profile',
      description: 'Add more skills to attract better offers',
      action: '/profile/edit',
      priority: 'high' as const,
    },
    {
      type: 'match',
      title: 'New Matching Request',
      description: 'E-commerce platform development matches your skills',
      action: '/requests/request_1',
      priority: 'medium' as const,
    },
    {
      type: 'trend',
      title: 'High Demand Skill',
      description: 'AI/ML skills are in high demand this week',
      action: '/skills',
      priority: 'low' as const,
    },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: 'activity_1',
      type: 'deal',
      title: 'Deal Created',
      description: 'Mobile App UI Design deal started',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      data: { dealId: 'deal_1' },
    },
    {
      id: 'activity_2',
      type: 'proposal',
      title: 'Proposal Received',
      description: 'New proposal for your request',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      data: { proposalId: 'proposal_1' },
    },
    {
      id: 'activity_3',
      type: 'review',
      title: 'New Review',
      description: 'You received a 5-star review',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      data: { reviewId: 'review_1' },
    },
  ];

  return {
    stats,
    featuredOffers,
    urgentRequests,
    openDeals,
    aiSuggestions,
    recentActivity,
  };
}
