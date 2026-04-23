#!/usr/bin/env tsx
/**
 * AI User Mass Simulator - Chạy mạnh tay, tạo data nhanh
 * Tốc độ cao, log lỗi chi tiết, fix ngay
 * 
 * Usage: npx tsx scripts/ai-user-mass-simulator.ts --duration=60 --rate=10
 */

import axios from 'axios';
import { faker } from '@faker-js/faker';

const API_URL = 'http://localhost:3000/api/v1';
const LOG_FILE = 'mass-simulator-errors.log';

// Stats
const stats = {
  usersCreated: 0,
  usersFailed: 0,
  offersCreated: 0,
  offersFailed: 0,
  requestsCreated: 0,
  requestsFailed: 0,
  proposalsCreated: 0,
  proposalsFailed: 0,
  dealsCreated: 0,
  dealsFailed: 0,
  errors: [] as string[],
};

function log(level: 'INFO' | 'ERROR' | 'SUCCESS', message: string) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${level}: ${message}`;
  console.log(logLine);
  if (level === 'ERROR') {
    stats.errors.push(logLine);
    // Keep last 100 errors
    if (stats.errors.length > 100) stats.errors.shift();
  }
}

// User pools
const createdUsers: { email: string; token: string; id: string }[] = [];
const createdOffers: any[] = [];

async function createUserFast(): Promise<{ email: string; token: string; id: string } | null> {
  const email = `mass.${faker.string.alphanumeric(8)}@ai.skillvalue.io`;
  const password = 'MassPass123!';

  try {
    const signupRes = await axios.post(`${API_URL}/auth/signup`, {
      email,
      password,
      role: 'member',
    }, { timeout: 5000 });

    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    }, { timeout: 5000 });

    const token = loginRes.data?.data?.token || loginRes.data?.token;
    const id = signupRes.data?.data?.id || signupRes.data?.id;

    if (token && id) {
      createdUsers.push({ email, token, id });
      stats.usersCreated++;
      return { email, token, id };
    }
    return null;
  } catch (error: any) {
    stats.usersFailed++;
    // If user exists, try login
    if (error.response?.status === 409) {
      try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password }, { timeout: 5000 });
        const token = loginRes.data?.data?.token || loginRes.data?.token;
        if (token) {
          createdUsers.push({ email, token, id: 'existing' });
          stats.usersCreated++;
          return { email, token, id: 'existing' };
        }
      } catch (e) {
        log('ERROR', `Login failed for ${email}: ${e.message}`);
      }
    } else {
      log('ERROR', `Create user failed: ${error.message} (status: ${error.response?.status})`);
    }
    return null;
  }
}

async function createOfferFast(user: { token: string }): Promise<any> {
  const skills = faker.helpers.arrayElements([
    'React', 'Node.js', 'Python', 'Design', 'Writing', 'Marketing'
  ], faker.number.int({ min: 2, max: 4 }));

  const offer = {
    title: `${skills[0]} Services - ${faker.commerce.productAdjective()}`,
    description: faker.lorem.paragraphs(2),
    price: faker.number.int({ min: 500, max: 10000 }),
    currency: 'USD',
    pricingType: faker.helpers.arrayElement(['fixed', 'hourly', 'negotiable']),
    skills,
    deliveryTime: faker.number.int({ min: 1, max: 30 }),
    category: faker.helpers.arrayElement(['Development', 'Design', 'Marketing']),
  };

  try {
    const res = await axios.post(`${API_URL}/offers`, offer, {
      headers: { Authorization: `Bearer ${user.token}` },
      timeout: 5000,
    });
    createdOffers.push(res.data);
    stats.offersCreated++;
    return res.data;
  } catch (error: any) {
    stats.offersFailed++;
    log('ERROR', `Create offer failed: ${error.message}`);
    return null;
  }
}

async function createRequestFast(user: { token: string }): Promise<any> {
  const request = {
    title: `Need ${faker.commerce.productName()} Developer`,
    description: faker.lorem.paragraphs(3),
    budget: {
      min: faker.number.int({ min: 500, max: 2000 }),
      max: faker.number.int({ min: 3000, max: 10000 }),
      currency: 'USD',
      negotiable: true,
    },
    skills: faker.helpers.arrayElements(['React', 'Node.js', 'Python'], 2),
    urgency: faker.helpers.arrayElement(['low', 'medium', 'high']),
    experienceLevel: faker.helpers.arrayElement(['beginner', 'intermediate', 'expert']),
  };

  try {
    const res = await axios.post(`${API_URL}/requests`, request, {
      headers: { Authorization: `Bearer ${user.token}` },
      timeout: 5000,
    });
    stats.requestsCreated++;
    return res.data;
  } catch (error: any) {
    stats.requestsFailed++;
    log('ERROR', `Create request failed: ${error.message}`);
    return null;
  }
}

async function runWorkerBatch(batchSize: number) {
  const promises: Promise<void>[] = [];

  for (let i = 0; i < batchSize; i++) {
    promises.push(
      (async () => {
        const user = await createUserFast();
        if (user) {
          // 70% create offers
          if (Math.random() > 0.3) {
            await createOfferFast(user);
          }
          // 50% create requests
          if (Math.random() > 0.5) {
            await createRequestFast(user);
          }
        }
      })()
    );
  }

  await Promise.all(promises);
}

async function main() {
  const args = process.argv.slice(2);
  const duration = parseInt(args.find(a => a.startsWith('--duration='))?.split('=')[1] || '60'); // seconds
  const rate = parseInt(args.find(a => a.startsWith('--rate='))?.split('=')[1] || '10'); // users per batch

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     AI USER MASS SIMULATOR - HIGH SPEED TEST             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`Duration: ${duration}s | Rate: ${rate} users/batch`);
  console.log(`Target: ~${(duration / 60 * rate * 6).toFixed(0)}K entities (simulating months)`);
  console.log('');

  // Check API
  try {
    await axios.get(`${API_URL}/health`, { timeout: 5000 });
    log('SUCCESS', 'API online');
  } catch {
    log('ERROR', 'API offline! Start with: npm start');
    process.exit(1);
  }

  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);
  let batchNum = 0;

  console.log('\n🚀 STARTING MASS SIMULATION...\n');

  while (Date.now() < endTime) {
    batchNum++;
    await runWorkerBatch(rate);

    // Stats every 10 batches
    if (batchNum % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rps = ((stats.usersCreated + stats.offersCreated + stats.requestsCreated) / parseFloat(elapsed)).toFixed(1);
      process.stdout.write(`\r⏳ Batch ${batchNum} | Users: ${stats.usersCreated} | Offers: ${stats.offersCreated} | RPS: ${rps}/s`);
    }

    // Small delay to not kill the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Final stats
  console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL RESULTS                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`Duration: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log(`Users: ${stats.usersCreated} (failed: ${stats.usersFailed})`);
  console.log(`Offers: ${stats.offersCreated} (failed: ${stats.offersFailed})`);
  console.log(`Requests: ${stats.requestsCreated} (failed: ${stats.requestsFailed})`);
  console.log(`Total Entities: ${stats.usersCreated + stats.offersCreated + stats.requestsCreated}`);
  console.log(`Errors logged: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n📋 Recent Errors:');
    stats.errors.slice(-10).forEach(e => console.log(`  ${e}`));
  }

  // Test if system still works
  console.log('\n🧪 Testing system stability...');
  try {
    await axios.get(`${API_URL}/health`, { timeout: 5000 });
    log('SUCCESS', 'System stable after mass test');
  } catch {
    log('ERROR', 'System may be unstable!');
  }
}

main().catch(e => {
  log('ERROR', `Fatal error: ${e.message}`);
  process.exit(1);
});
