import { AiMatchResult, AiPriceResult, AiSupportResponse, AiNextActionResult } from '../types/ai';

export const mockMatchResults: Record<string, AiMatchResult> = {
  offer: {
    matches: [
      {
        id: 'match_1',
        type: 'offer',
        itemId: 'offer_1',
        title: 'AI-Powered Web Application Development',
        score: 0.95,
        reason: 'High match based on skills and requirements',
      },
      {
        id: 'match_2',
        type: 'offer',
        itemId: 'offer_3',
        title: 'Python Data Analysis & Visualization',
        score: 0.87,
        reason: 'Good match based on experience level',
      },
    ],
    total: 2,
    confidence: 0.91,
  },
  request: {
    matches: [
      {
        id: 'match_3',
        type: 'request',
        itemId: 'request_1',
        title: 'E-commerce Platform Development',
        score: 0.92,
        reason: 'Perfect match for your expertise',
      },
      {
        id: 'match_4',
        type: 'request',
        itemId: 'request_2',
        title: 'Mobile App UI Design',
        score: 0.78,
        reason: 'Good match based on portfolio',
      },
    ],
    total: 2,
    confidence: 0.85,
  },
};

export const mockPriceResults: Record<string, AiPriceResult> = {
  default: {
    pricing: {
      min: 4000,
      max: 8000,
      recommended: 6000,
      currency: 'USD',
      confidence: 0.85,
    },
    factors: [
      'Market demand is high for this skill set',
      'Your experience level commands premium rates',
      'Geographic location affects pricing',
      'Project complexity is above average',
    ],
    marketData: {
      averagePrice: 5500,
      medianPrice: 5800,
      demandLevel: 'high',
      competitionLevel: 'medium',
    },
  },
};

export const mockSupportResponses: Record<string, AiSupportResponse> = {
  default: {
    response: {
      text: 'I can help you with that. Based on your question, here are some suggestions to get you started.',
      suggestions: [
        'Check your deal status',
        'Contact support team',
        'View documentation',
        'Browse help center',
      ],
      actions: [
        {
          type: 'navigate',
          target: '/deals',
        },
      ],
    },
    confidence: 0.92,
  },
};

export const mockNextActions: Record<string, AiNextActionResult> = {
  default: {
    action: {
      type: 'complete_profile',
      message: 'Complete your profile to increase trust score and attract more clients',
      priority: 'high',
      target: '/profile/edit',
    },
    alternatives: [
      {
        type: 'browse_offers',
        message: 'Browse available offers in your category',
        priority: 'medium',
        target: '/offers',
      },
      {
        type: 'view_requests',
        message: 'Check out new requests that match your skills',
        priority: 'medium',
        target: '/requests',
      },
    ],
  },
};

export function getMatchResults(type: 'offer' | 'request'): AiMatchResult {
  return mockMatchResults[type] || mockMatchResults.offer;
}

export function getPriceResult(key: string = 'default'): AiPriceResult {
  return mockPriceResults[key] || mockPriceResults.default;
}

export function getSupportResponse(key: string = 'default'): AiSupportResponse {
  return mockSupportResponses[key] || mockSupportResponses.default;
}

export function getNextAction(key: string = 'default'): AiNextActionResult {
  return mockNextActions[key] || mockNextActions.default;
}
