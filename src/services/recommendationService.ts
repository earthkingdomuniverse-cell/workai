import { Recommendation, RecommendationInput, RecommendationOutput } from '../types/recommendation';
import { mockOffers } from '../mocks/offers';
import { mockRequests } from '../mocks/requests';

export interface RecommendationService {
  getHomeRecommendations(input: RecommendationInput): Promise<RecommendationOutput>;
  getExploreRecommendations(input: RecommendationInput): Promise<RecommendationOutput>;
}

class RecommendationServiceImpl implements RecommendationService {
  async getHomeRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
    const items = this.buildRecommendations(input).slice(0, 10);
    return { items, total: items.length, timestamp: new Date().toISOString() };
  }

  async getExploreRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
    const items = this.buildRecommendations(input);
    return { items, total: items.length, timestamp: new Date().toISOString() };
  }

  private buildRecommendations(input: RecommendationInput): Recommendation[] {
    const profileSkills = (input.skills || input.profile?.skills || []).map((skill: string) =>
      skill.toLowerCase(),
    );

    const offerItems: Recommendation[] = mockOffers.map((offer) => {
      const matchedSkills = (offer.skills || []).filter((skill) =>
        profileSkills.some((profileSkill: string) => skill.toLowerCase().includes(profileSkill)),
      );
      const score = Math.min(100, 45 + matchedSkills.length * 15);
      return {
        id: `rec_offer_${offer.id}`,
        type: 'offer',
        entityId: offer.id,
        title: offer.title,
        description: offer.description,
        reason: matchedSkills.length > 0 ? 'skill_match' : 'popular',
        reasonText:
          matchedSkills.length > 0
            ? `Matches skills: ${matchedSkills.join(', ')}`
            : 'Popular active offer',
        score,
        relevance: score / 100,
        metadata: {
          price: offer.price,
          currency: offer.currency,
          deliveryTime: offer.deliveryTime,
          provider: {
            id: offer.providerId,
            displayName: `Provider ${offer.providerId}`,
          },
          skills: offer.skills,
        },
        createdAt: offer.createdAt,
      };
    });

    const requestItems: Recommendation[] = mockRequests.map((request) => {
      const matchedSkills = (request.skills || []).filter((skill) =>
        profileSkills.some((profileSkill: string) => skill.toLowerCase().includes(profileSkill)),
      );
      const score = Math.min(100, 40 + matchedSkills.length * 18);
      return {
        id: `rec_request_${request.id}`,
        type: 'request',
        entityId: request.id,
        title: request.title,
        description: request.description,
        reason: matchedSkills.length > 0 ? 'skill_match' : 'budget_match',
        reasonText:
          matchedSkills.length > 0
            ? `Matches your skills: ${matchedSkills.join(', ')}`
            : 'Reasonable marketplace fit',
        score,
        relevance: score / 100,
        metadata: {
          budget: request.budget,
          skills: request.skills,
          requester: {
            id: request.requesterId,
            displayName: `Requester ${request.requesterId}`,
          },
        },
        createdAt: request.createdAt,
      };
    });

    return [...offerItems, ...requestItems].sort((a, b) => b.score - a.score);
  }
}

export const recommendationService: RecommendationService = new RecommendationServiceImpl();
