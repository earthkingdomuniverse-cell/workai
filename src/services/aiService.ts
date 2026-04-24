import { AiMatchInput, AiMatchOutput, AiRecommendation } from '../types/ai';
import { SupportTicketInput, SupportTicketOutput } from '../types/support';
import { prisma } from '../db/prismaClient';
import { aiSupportService } from './aiSupportService';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import { BadRequestError } from '../lib/errors';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'dummy_key',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

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
    
    // Fetch offers from database instead of mock data
    const offers = await prisma.offer.findMany({
      where: { status: 'active' },
      take: 50 // Limit to avoid memory issues with large datasets
    });

    const recommendations = offers
      .map<AiRecommendation>((offer) => {
        let offerSkills: string[] = [];
        try {
          if (offer.skills) offerSkills = JSON.parse(offer.skills);
        } catch(e) {}
        
        const matchedSkills = offerSkills.filter((skill) =>
          normalizedSkills.some((candidate) => skill.toLowerCase().includes(candidate)),
        );

        const titleMatch = offer.title.toLowerCase().includes(input.title.toLowerCase());
        const budgetMidpoint = input.budget
          ? ((input.budget.min || 0) + (input.budget.max || 0)) / 2
          : undefined;
        const budgetMatch = budgetMidpoint ? Math.abs(offer.price - budgetMidpoint) < 1000 : false;

        let score = matchedSkills.length * 20;
        if (titleMatch) score += 25;
        if (budgetMatch) score += 15;

        return {
          id: `rec_${offer.id}`,
          type: 'offer',
          title: offer.title,
          description: offer.description,
          score: Math.min(100, score),
          reason:
            matchedSkills.length > 0
              ? `Matched skills: ${matchedSkills.join(', ')}`
              : 'Relevant marketplace result',
          matchFactors: [
            {
              name: 'skills',
              weight: 0.5,
              score: Math.min(100, matchedSkills.length * 25),
              reason:
                matchedSkills.length > 0
                  ? `Matched ${matchedSkills.length} skill(s)`
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
          tags: offerSkills,
          price: offer.price,
          currency: offer.currency,
          deliveryTime: offer.deliveryTime || 0,
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
    try {
      const prompt = `You are an AI pricing expert for a freelance marketplace.
Given a service titled "${input.title}" with skills [${input.skills.join(', ')}] by a provider at "${input.providerLevel}" level.
Suggest a fair market price in USD. Return strictly JSON with the following format:
{
  "suggested_price": number,
  "floor_price": number,
  "ceiling_price": number,
  "reasoning": ["reason 1", "reason 2"]
}
Output ONLY valid JSON, without any markdown formatting like \`\`\`json.`;

      const response = await openai.chat.completions.create({
        model: 'mistralai/mixtral-8x22b-instruct-v0.1',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      let content = response.choices[0]?.message?.content || '{}';
      content = content
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(content);

      if (parsed.suggested_price) {
        return parsed as PriceSuggestionOutput;
      }
      throw new BadRequestError('Invalid AI JSON format');
    } catch (err: any) {
      console.error('NVIDIA AI Price Error, falling back to heuristics:', err.message);
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
          `Estimated from ${input.skills.length} declared skills (Fallback mode)`,
          `Adjusted for ${input.providerLevel} provider level`,
          'Applied heuristic market range fallback',
        ],
      };
    }
  }

  async support(input: SupportTicketInput): Promise<SupportTicketOutput> {
    return aiSupportService.classifyAndRespond(input);
  }
}

export const aiService: AiService = new AiServiceImpl();
