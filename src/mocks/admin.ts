import {
  AdminOverview,
  ReviewQueueItem,
  DisputeCase,
  FraudReport,
  RiskSignal,
} from '../types/admin';

export const mockAdminOverview: AdminOverview = {
  users: {
    total: 1250,
    active: 890,
    newToday: 15,
    newThisWeek: 87,
    newThisMonth: 342,
  },
  deals: {
    total: 450,
    active: 120,
    completed: 310,
    disputed: 15,
    cancelled: 5,
  },
  revenue: {
    total: 125000,
    today: 5000,
    thisWeek: 25000,
    thisMonth: 95000,
    currency: 'USD',
  },
  trust: {
    averageScore: 4.2,
    verificationRate: 0.78,
    activeFlags: 3,
  },
  risk: {
    activeAlerts: 5,
    pendingReviews: 12,
    fraudReports: 3,
  },
};

export const mockReviewQueue: ReviewQueueItem[] = [
  {
    id: 'review_queue_1',
    type: 'user',
    itemId: 'user_5',
    reason: 'Suspicious activity detected',
    priority: 'high',
    reportedBy: 'system',
    reportedAt: '2024-01-20T10:00:00Z',
    status: 'pending',
  },
  {
    id: 'review_queue_2',
    type: 'offer',
    itemId: 'offer_5',
    reason: 'Inappropriate content',
    priority: 'medium',
    reportedBy: 'user_2',
    reportedAt: '2024-01-19T15:00:00Z',
    status: 'under_review',
    assignedTo: 'user_3',
  },
  {
    id: 'review_queue_3',
    type: 'dispute',
    itemId: 'deal_3',
    reason: 'Dispute escalation',
    priority: 'urgent',
    reportedAt: '2024-01-21T09:00:00Z',
    status: 'pending',
  },
];

export const mockDisputes: DisputeCase[] = [
  {
    id: 'dispute_1',
    dealId: 'deal_3',
    raisedBy: 'client',
    reason: 'Work not delivered as expected',
    description: 'The delivered work does not meet the agreed specifications.',
    status: 'under_review',
    evidence: ['evidence_1.pdf', 'evidence_2.pdf'],
    timeline: {
      raisedAt: '2024-01-18T10:00:00Z',
      firstResponseAt: '2024-01-18T14:00:00Z',
    },
  },
  {
    id: 'dispute_2',
    dealId: 'deal_4',
    raisedBy: 'provider',
    reason: 'Payment not released',
    description: 'Work completed and submitted but payment not released.',
    status: 'mediation',
    evidence: ['evidence_3.pdf'],
    assignedMediator: 'user_3',
    timeline: {
      raisedAt: '2024-01-15T10:00:00Z',
      firstResponseAt: '2024-01-15T16:00:00Z',
      mediationStartedAt: '2024-01-16T10:00:00Z',
    },
  },
];

export const mockFraudReports: FraudReport[] = [
  {
    id: 'fraud_1',
    type: 'account_takeover',
    severity: 'critical',
    status: 'investigating',
    reportedBy: 'system',
    reportedAt: '2024-01-21T08:00:00Z',
    description: 'Unusual login pattern detected from multiple locations',
    evidence: ['login_log_1.pdf'],
    involvedUsers: ['user_6'],
    assignedInvestigator: 'user_4',
  },
  {
    id: 'fraud_2',
    type: 'transaction',
    severity: 'high',
    status: 'pending',
    reportedBy: 'user_2',
    reportedAt: '2024-01-20T14:00:00Z',
    description: 'Suspicious transaction amount',
    evidence: [],
    involvedUsers: ['user_7', 'user_8'],
  },
];

export const mockRiskSignals: RiskSignal[] = [
  {
    id: 'risk_1',
    type: 'multiple_failed_logins',
    severity: 'medium',
    source: 'auth_system',
    targetId: 'user_9',
    targetType: 'user',
    description: 'Multiple failed login attempts from different IP addresses',
    metadata: {
      attempts: 5,
      timeWindow: '10 minutes',
    },
    createdAt: '2024-01-21T10:00:00Z',
    acknowledged: false,
  },
  {
    id: 'risk_2',
    type: 'unusual_transaction',
    severity: 'high',
    source: 'payment_system',
    targetId: 'transaction_5',
    targetType: 'transaction',
    description: 'Transaction amount significantly higher than user average',
    metadata: {
      amount: 50000,
      userAverage: 2000,
    },
    createdAt: '2024-01-21T09:00:00Z',
    acknowledged: true,
    acknowledgedBy: 'user_4',
    acknowledgedAt: '2024-01-21T09:30:00Z',
  },
];

export function getReviewQueue(): ReviewQueueItem[] {
  return mockReviewQueue;
}

export function getDisputes(): DisputeCase[] {
  return mockDisputes;
}

export function getFraudReports(): FraudReport[] {
  return mockFraudReports;
}

export function getRiskSignals(): RiskSignal[] {
  return mockRiskSignals;
}
