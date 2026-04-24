import { AiMatchInput, AiMatchOutput, AiRecommendation } from '../types/ai';
import { SupportTicketInput, SupportTicketOutput } from '../types/support';
import { prisma } from '../lib/prisma';
import { aiSupportService } from './aiSupportService';

export interface PriceSuggestionInput {
  title: string;
  skills: string[];
  providerLevel: 'beginner' | 'intermediate' | 'expert';
}

export interface PriceSuggestionOutput {
  suggested_price: number;
  floor_price: number;
  ceiling_price: number;
  reasoning: string[];
}

export interface AiService {
  match(input: AiMatchInput): Promise<AiMatchOutput>;
  getRecommendations(input: AiMatchInput): Promise<AiRecommendation[]>;
  suggestPrice(input: PriceSuggestionInput): Promise<PriceSuggestionOutput>;
  support(input: SupportTicketInput): Promise<SupportTicketOutput>;
}

class AiServiceImpl implements AiService {
  async match(input: AiMatchInput): Promise<AiMatchOutput> {
    const normalizedSkills = input.skills.map((skill) => skill.toLowerCase());

    const offers = await prisma.offer.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const recommendations = offers
      .map<AiRecommendation>((offer) => {
        const searchable = [offer.title, offer.description, offer.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchedSkills = normalizedSkills.filter((skill) => searchable.includes(skill));
        const titleMatch = offer.title.toLowerCase().includes(input.title.toLowerCase());
        const budgetMidpoint = input.budget
          ? ((input.budget.min || 0) + (input.budget.max || 0)) / 2
          : undefined;
        const budgetMatch = budgetMidpoint ? Math.abs(offer.price - budgetMidpoint) < 1000 : false;

        let score = matchedSkills.length * 20;
        if (titleMatch) score += 25;
        if (budgetMatch) score += 15;
        if (offer.category && input.title.toLowerCase().includes(offer.category.toLowerCase())) score += 10;

        return {
          id: `rec_${offer.id}`,
          type: 'offer',
          title: offer.title,
          description: offer.description,
          score: Math.min(100, score),
          reason:
            matchedSkills.length > 0
              ? `Matched terms: ${matchedSkills.join(', ')}`
              : 'Relevant marketplace result',
          matchFactors: [
            {
              name: 'skills',
              weight: 0.5,
              score: Math.min(100, matchedSkills.length * 25),
              reason:
                matchedSkills.length > 0
                  ? `Matched ${matchedSkills.length} term(s)`
                  : 'No strong skill overlap',
            },
            {
              name: 'title',
              weight: 0.3,
              score: titleMatch ? 100 : 40,
              reason: titleMatch
                ? 'Title strongly matches request intent'
                : 'Partial semantic overlap',
            },
            {
              name: 'budget',
              weight: 0.2,
              score: budgetMatch ? 100 : 50,
              reason: budgetMatch ? 'Fits target budget range' : 'Budget may need negotiation',
            },
          ],
          entityId: offer.id,
          entity: offer,
          tags: offer.category ? [offer.category] : [],
          price: offer.price,
          currency: offer.currency,
        };
      })
      .filter((item) => item.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      recommendations,
      requestId: `req_${Date.now()}`,
    };
  }

  async getRecommendations(input: AiMatchInput): Promise<AiRecommendation[]> {
    const result = await this.match(input);
    return result.recommendations;
  }

  async suggestPrice(input: PriceSuggestionInput): Promise<PriceSuggestionOutput> {
    const skillWeight = input.skills.length * 120;
    const titleWeight = Math.max(50, input.title.length * 6);
    const multiplier =
      input.providerLevel === 'expert' ? 1.5 : input.providerLevel === 'intermediate' ? 1 : 0.7;
    const base = Math.round((skillWeight + titleWeight) * multiplier);

    return {
      suggested_price: base,
      floor_price: Math.round(base * 0.75),
      ceiling_price: Math.round(base * 1.3),
      reasoning: [
        `Estimated from ${input.skills.length} declared skills`,
        `Adjusted for ${input.providerLevel} provider level`,
        'Applied heuristic market range fallback',
      ],
    };
  }

  async support(input: SupportTicketInput): Promise<SupportTicketOutput> {
    return aiSupportService.classifyAndRespond(input);
  }
}

export const aiService: AiService = new AiServiceImpl();
