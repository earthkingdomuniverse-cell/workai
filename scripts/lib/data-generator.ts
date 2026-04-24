import { z } from 'zod';
import { AIProvider } from './ai-provider';
import { faker } from '@faker-js/faker';

// Schemas for AI Generation
const personaSchema = z.object({
  displayName: z.string(),
  bio: z.string(),
  skills: z.array(z.string()).min(2).max(5),
});

const offerSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  pricingType: z.enum(['fixed', 'hourly']),
  category: z.string(),
  deliveryTime: z.number(),
});

const requestSchema = z.object({
  title: z.string(),
  description: z.string(),
  budgetMin: z.number(),
  budgetMax: z.number(),
  category: z.string(),
});

export class DataGenerator {
  constructor(private aiProvider: AIProvider, private useFakerFallback: boolean = false) {}

  private async tryAIGenerate<T>(prompt: string, schema: z.ZodSchema<T>, systemPrompt: string, fallback: () => T): Promise<T> {
    if (this.useFakerFallback) return fallback();
    try {
      return await this.aiProvider.generateJSON(prompt, schema, systemPrompt);
    } catch (e) {
      console.warn('AI generation failed, falling back to Faker:', e);
      return fallback();
    }
  }

  async generatePersona() {
    return this.tryAIGenerate(
      'Generate a realistic freelancer persona with a name, a professional bio, and 3-5 technical or creative skills.',
      personaSchema,
      'You are a data generator for a freelance marketplace. Generate highly realistic, professional data.',
      () => ({
        displayName: faker.person.fullName(),
        bio: faker.person.bio(),
        skills: [faker.person.jobArea(), faker.person.jobType(), faker.word.noun()],
      })
    );
  }

  async generateOfferContent(skills: string[]) {
    return this.tryAIGenerate(
      `Generate a professional freelance service offer based on these skills: ${skills.join(', ')}`,
      offerSchema,
      'You are a professional freelancer creating an attractive service offering.',
      () => ({
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        price: faker.number.int({ min: 50, max: 1000 }),
        pricingType: faker.helpers.arrayElement(['fixed', 'hourly'] as const),
        category: skills[0] || 'General',
        deliveryTime: faker.number.int({ min: 1, max: 30 }),
      })
    );
  }

  async generateRequestContent() {
    return this.tryAIGenerate(
      'Generate a realistic client project request looking for freelance talent.',
      requestSchema,
      'You are a client looking to hire a freelancer. Create a detailed project request.',
      () => {
        const min = faker.number.int({ min: 100, max: 500 });
        return {
          title: 'Need help with ' + faker.company.bs(),
          description: faker.lorem.paragraphs(2),
          budgetMin: min,
          budgetMax: min + faker.number.int({ min: 100, max: 1000 }),
          category: faker.person.jobArea(),
        };
      }
    );
  }
}
