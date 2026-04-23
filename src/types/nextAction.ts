export type NextActionType =
  | 'complete_profile'
  | 'create_first_offer'
  | 'send_proposal'
  | 'fund_deal'
  | 'submit_work'
  | 'release_funds'
  | 'review_completed_work'
  | 'respond_to_proposal'
  | 'update_skills'
  | 'verify_identity'
  | 'check_notifications'
  | 'view_analytics'
  | 'explore_offers'
  | 'explore_requests';

export interface NextAction {
  id: string;
  type: NextActionType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cta: string;
  route: string;
  icon: string;
  context?: any;
  deadline?: string;
}

export interface NextActionInput {
  userId: string;
  profile?: any;
  deals?: any[];
  offers?: any[];
  proposals?: any[];
  trustProfile?: any;
  notifications?: any[];
}

export interface NextActionOutput {
  actions: NextAction[];
  userId: string;
  timestamp: string;
}

export const NEXT_ACTION_TEMPLATES: Record<NextActionType, Omit<NextAction, 'id' | 'context'>> = {
  complete_profile: {
    type: 'complete_profile',
    title: 'Complete Your Profile',
    description: 'Add more details to your profile to increase your visibility and trust score',
    priority: 'high',
    cta: 'Complete Profile',
    route: '/profile/setup',
    icon: '📝',
  },
  create_first_offer: {
    type: 'create_first_offer',
    title: 'Create Your First Offer',
    description: 'Showcase your skills by creating an offer that potential clients can browse',
    priority: 'medium',
    cta: 'Create Offer',
    route: '/offers/create',
    icon: '💼',
  },
  send_proposal: {
    type: 'send_proposal',
    title: 'Send a Proposal',
    description: 'Respond to relevant requests by sending a customized proposal',
    priority: 'medium',
    cta: 'Send Proposal',
    route: '/proposals/create',
    icon: '✉️',
  },
  fund_deal: {
    type: 'fund_deal',
    title: 'Fund Your Deal',
    description: 'Secure your deal by funding the agreed amount',
    priority: 'high',
    cta: 'Fund Deal',
    route: '/deals/:id/fund',
    icon: '💰',
  },
  submit_work: {
    type: 'submit_work',
    title: 'Submit Your Work',
    description: 'Complete your milestone and submit your work for review',
    priority: 'medium',
    cta: 'Submit Work',
    route: '/deals/:id/submit',
    icon: '✅',
  },
  release_funds: {
    type: 'release_funds',
    title: 'Release Funds',
    description: 'Release payment for completed work',
    priority: 'medium',
    cta: 'Release Funds',
    route: '/deals/:id/release',
    icon: '🔓',
  },
  review_completed_work: {
    type: 'review_completed_work',
    title: 'Review Completed Work',
    description: 'Review the work and provide feedback',
    priority: 'medium',
    cta: 'Review Work',
    route: '/deals/:id/review',
    icon: '⭐',
  },
  respond_to_proposal: {
    type: 'respond_to_proposal',
    title: 'Respond to Proposal',
    description: 'Review and respond to a proposal you received',
    priority: 'high',
    cta: 'View Proposal',
    route: '/proposals/:id',
    icon: '📩',
  },
  update_skills: {
    type: 'update_skills',
    title: 'Update Your Skills',
    description: 'Add new skills to your profile to match current market demands',
    priority: 'low',
    cta: 'Update Skills',
    route: '/profile/skills',
    icon: '🔧',
  },
  verify_identity: {
    type: 'verify_identity',
    title: 'Verify Your Identity',
    description: 'Increase your trust score by verifying your identity',
    priority: 'medium',
    cta: 'Verify Identity',
    route: '/profile/verification',
    icon: '🆔',
  },
  check_notifications: {
    type: 'check_notifications',
    title: 'Check Notifications',
    description: 'You have unread notifications that may require your attention',
    priority: 'low',
    cta: 'View Notifications',
    route: '/notifications',
    icon: '🔔',
  },
  view_analytics: {
    type: 'view_analytics',
    title: 'View Your Analytics',
    description: 'Check your performance metrics and earnings',
    priority: 'low',
    cta: 'View Analytics',
    route: '/analytics',
    icon: '📊',
  },
  explore_offers: {
    type: 'explore_offers',
    title: 'Explore Offers',
    description: 'Browse available offers that match your needs',
    priority: 'low',
    cta: 'Browse Offers',
    route: '/offers',
    icon: '🔍',
  },
  explore_requests: {
    type: 'explore_requests',
    title: 'Explore Requests',
    description: 'Find requests that match your skills',
    priority: 'low',
    cta: 'Browse Requests',
    route: '/requests',
    icon: '📋',
  },
};
