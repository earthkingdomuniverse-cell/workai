import {
  NextActionInput,
  NextActionOutput,
  NextAction,
  NEXT_ACTION_TEMPLATES,
} from '../types/nextAction';
import { mockUsers, mockOffers, mockDeals, mockProposals } from '../mocks';
import { trustService } from './trustService';

export interface AiAssistantService {
  getNextActions(input: NextActionInput): Promise<NextActionOutput>;
  generateNextActions(input: NextActionInput): Promise<NextAction[]>;
}

class AiAssistantServiceImpl implements AiAssistantService {
  async getNextActions(input: NextActionInput): Promise<NextActionOutput> {
    const actions = await this.generateNextActions(input);

    return {
      actions,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    };
  }

  async generateNextActions(input: NextActionInput): Promise<NextAction[]> {
    const actions: NextAction[] = [];
    const user = mockUsers.find((u) => u.id === input.userId);

    if (!user) {
      return [];
    }

    // Check if profile is complete (less than 50% completion)
    if (!user.bio || !user.skills || user.skills.length < 3) {
      actions.push({
        id: `action_${Date.now()}_1`,
        ...NEXT_ACTION_TEMPLATES.complete_profile,
        context: {
          completion: user.bio && user.skills ? 'partial' : 'incomplete',
        },
      });
    }

    // Check if user has created any offers
    const userOffers = mockOffers.filter((o) => o.providerId === input.userId);
    if (userOffers.length === 0) {
      actions.push({
        id: `action_${Date.now()}_2`,
        ...NEXT_ACTION_TEMPLATES.create_first_offer,
      });
    }

    // Check for pending proposals that need response
    const pendingProposals = mockProposals.filter(
      (p) => p.providerId === input.userId && p.status === 'pending',
    );
    if (pendingProposals.length > 0) {
      actions.push({
        id: `action_${Date.now()}_3`,
        ...NEXT_ACTION_TEMPLATES.respond_to_proposal,
        context: {
          count: pendingProposals.length,
        },
      });
    }

    // Check for deals that need work submission
    const dealsToSubmit = mockDeals.filter(
      (d) => d.providerId === input.userId && d.status === 'funded',
    );
    if (dealsToSubmit.length > 0) {
      actions.push({
        id: `action_${Date.now()}_4`,
        ...NEXT_ACTION_TEMPLATES.submit_work,
        context: {
          count: dealsToSubmit.length,
        },
      });
    }

    // Check for deals that need funds released
    const dealsToRelease = mockDeals.filter(
      (d) => d.clientId === input.userId && d.status === 'submitted',
    );
    if (dealsToRelease.length > 0) {
      actions.push({
        id: `action_${Date.now()}_5`,
        ...NEXT_ACTION_TEMPLATES.release_funds,
        context: {
          count: dealsToRelease.length,
        },
      });
    }

    // Check for deals that need review
    const dealsToReview = mockDeals.filter(
      (d) =>
        d.status === 'released' &&
        (!d.review || d.review.length === 0) &&
        (d.clientId === input.userId || d.providerId === input.userId),
    );
    if (dealsToReview.length > 0) {
      actions.push({
        id: `action_${Date.now()}_6`,
        ...NEXT_ACTION_TEMPLATES.review_completed_work,
        context: {
          count: dealsToReview.length,
        },
      });
    }

    // Check trust profile for verification
    try {
      const trustProfile = await trustService.getTrustProfile(input.userId);
      if (
        trustProfile.verificationLevel === 'unverified' ||
        trustProfile.verificationLevel === 'basic'
      ) {
        actions.push({
          id: `action_${Date.now()}_7`,
          ...NEXT_ACTION_TEMPLATES.verify_identity,
        });
      }
    } catch (error) {
      // If trust profile doesn't exist, suggest verification
      actions.push({
        id: `action_${Date.now()}_7`,
        ...NEXT_ACTION_TEMPLATES.verify_identity,
      });
    }

    // If no specific actions, suggest general exploration
    if (actions.length === 0) {
      actions.push({
        id: `action_${Date.now()}_8`,
        ...NEXT_ACTION_TEMPLATES.explore_offers,
      });

      actions.push({
        id: `action_${Date.now()}_9`,
        ...NEXT_ACTION_TEMPLATES.explore_requests,
      });
    }

    // Sort by priority
    actions.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return actions.slice(0, 5); // Return top 5 actions
  }
}

export const aiAssistantService: AiAssistantService = new AiAssistantServiceImpl();
