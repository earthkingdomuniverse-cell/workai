import { parseArgs } from 'util';
import { getAIProvider } from './lib/ai-provider';
import { WorkAIClient } from './lib/api-client';
import { DataGenerator } from './lib/data-generator';
import { StatsTracker } from './lib/stats';
import { faker } from '@faker-js/faker';

async function seed(options: any) {
  const stats = new StatsTracker();
  const provider = getAIProvider(options.ai ? 'nvidia' : 'faker');
  const generator = new DataGenerator(provider, !options.ai);
  const client = new WorkAIClient();

  stats.logInfo(`Starting swarm seed. Users: ${options.users}, Offers: ${options.offers}, AI: ${options.ai ? 'yes' : 'no'}`);

  for (let i = 0; i < options.users; i++) {
    try {
      const email = faker.internet.email();
      const password = 'Password123!';
      const auth = await client.signup(email, password);
      const token = auth.data.token;
      stats.increment('users');

      const persona = await generator.generatePersona();
      
      for (let j = 0; j < (options.offers || 1); j++) {
        const offerData = await generator.generateOfferContent(persona.skills);
        await client.createOffer(token, { ...offerData, skills: persona.skills });
        stats.increment('offers');
      }

      for (let k = 0; k < (options.requests || 0); k++) {
        const reqData = await generator.generateRequestContent();
        await client.createRequest(token, reqData);
        stats.increment('requests');
      }

      if (i % 5 === 0) stats.logProgress();
    } catch (e) {
      stats.logError(`Failed generating user ${i}`, e);
    }
  }

  stats.summary();
}

async function simulate(options: any) {
  const stats = new StatsTracker();
  const client = new WorkAIClient();
  stats.logInfo(`Starting deal simulation. Cycles: ${options.cycles}`);

  for (let i = 0; i < options.cycles; i++) {
    try {
      // Create Provider
      const providerAuth = await client.signup(faker.internet.email(), 'Password123!');
      const providerToken = providerAuth.data.token;
      const providerId = providerAuth.data.user.id;
      stats.increment('users');

      // Create Client
      const clientAuth = await client.signup(faker.internet.email(), 'Password123!');
      const clientToken = clientAuth.data.token;
      const clientId = clientAuth.data.user.id;
      stats.increment('users');

      // Create Offer
      const offer = await client.createOffer(providerToken, {
        title: 'Complete Web Application',
        description: 'I will build your web application from scratch using React and Node.js',
        price: 1500,
        currency: 'USD',
        pricingType: 'fixed',
      });
      stats.increment('offers');

      // Create Deal
      const deal = await client.createDeal(clientToken, {
        offerId: offer.data.id,
        providerId,
        clientId,
        title: 'Project for Complete Web App',
        description: 'Let us build it.',
        amount: 1500,
        currency: 'USD',
      });
      const dealId = deal.data.id;

      // Deal Lifecycle
      await client.fundDeal(clientToken, dealId, 1500);
      await client.submitWork(providerToken, dealId);
      await client.releaseFunds(clientToken, dealId, 1500);
      
      await client.createReview(clientToken, {
        dealId,
        subjectType: 'user',
        subjectId: providerId,
        rating: 5,
        comment: 'Great work, delivered on time!',
      });

      stats.increment('deals');
      stats.logProgress();
    } catch (e) {
      stats.logError(`Simulation cycle ${i} failed`, e);
    }
  }

  stats.summary();
}

async function main() {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      users: { type: 'string', default: '10' },
      offers: { type: 'string', default: '2' },
      requests: { type: 'string', default: '1' },
      ai: { type: 'boolean', default: false },
      cycles: { type: 'string', default: '5' },
    },
    allowPositionals: true,
  });

  const command = positionals[0];

  if (command === 'seed') {
    await seed({
      users: parseInt(values.users as string),
      offers: parseInt(values.offers as string),
      requests: parseInt(values.requests as string),
      ai: values.ai,
    });
  } else if (command === 'simulate') {
    await simulate({
      cycles: parseInt(values.cycles as string),
    });
  } else {
    console.log(`
🚀 Unified Swarm Engine - WorkAI

Usage:
  npx tsx scripts/swarm.ts <command> [options]

Commands:
  seed        Seed the database with users, offers, and requests
    --users   Number of users to create (default: 10)
    --offers  Number of offers per user (default: 2)
    --requests Number of requests per user (default: 1)
    --ai      Use AI (NVIDIA) for realistic data (default: false, uses Faker)

  simulate    Simulate full marketplace deal cycles
    --cycles  Number of full deal cycles to simulate (default: 5)
    `);
  }
}

main().catch(console.error);
