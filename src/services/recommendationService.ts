import { Recommendation, RecommendationInput, RecommendationOutput } from '../types/recommendation';
import { prisma } from '../db/prismaClient';

export interface RecommendationService {
  getHomeRecommendations(input: RecommendationInput): Promise<RecommendationOutput>;
  getExploreRecommendations(input: RecommendationInput): Promise<RecommendationOutput>;
}

class RecommendationServiceImpl implements RecommendationService {
  async getHomeRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
    const items = (await this.buildRecommendations(input)).slice(0, 10);
    return { items, total: items.length, timestamp: new Date().toISOString() };
  }

  async getExploreRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
    const items = await this.buildRecommendations(input);
    return { items, total: items.length, timestamp: new Date().toISOString() };
  }

  private async buildRecommendations(input: RecommendationInput): Promise<Recommendation[]> {
    const profileSkills = (input.skills || input.profile?.skills || []).map((skill: string) =>
      skill.toLowerCase(),
    );

    const offers = await prisma.offer.findMany({
      where: { status: 'active' },
      take: 50
    });

    const offerItems: Recommendation[] = offers.map((offer) => {
      let offerSkills: string[] = [];
      try {
        if (offer.skills) offerSkills = JSON.parse(offer.skills);
      } catch(e) {}
      
      const matchedSkills = offerSkills.filter((skill) =>
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
          skills: offerSkills,
        },
        createdAt: offer.createdAt instanceof Date ? offer.createdAt.toISOString() : String(offer.createdAt),
      };
    });

    const requests = await prisma.request.findMany({
      where: { status: 'open' },
      take: 50
    });

    const requestItems: Recommendation[] = requests.map((request) => {
      let requestSkills: string[] = [];
      try {
        if (request.skills) requestSkills = JSON.parse(request.skills);
      } catch(e) {}

      const matchedSkills = requestSkills.filter((skill) =>
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
          budget: { min: request.budgetMin, max: request.budgetMax, currency: request.budgetCurrency },
          skills: requestSkills,
          requester: {
            id: request.requesterId,
            displayName: `Requester ${request.requesterId}`,
          },
        },
        createdAt: request.createdAt instanceof Date ? request.createdAt.toISOString() : String(request.createdAt),
      };
    });

    return [...offerItems, ...requestItems].sort((a, b) => b.score - a.score);
  }
}

export const recommendationService: RecommendationService = new RecommendationServiceImpl();
