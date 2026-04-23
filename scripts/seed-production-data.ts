#!/usr/bin/env tsx
/**
 * Seed Production Data
 * Tạo dữ liệu thật cho production/staging
 * 
 * Usage: npx tsx scripts/seed-production-data.ts --users=20 --offers=30
 */

import { faker } from '@faker-js/faker';
import axios from 'axios';
import { config } from 'dotenv';
config();

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface SimulatedUser {
  id?: string;
  email: string;
  password: string;
  displayName: string;
  bio: string;
  skills: string[];
  location: string;
  hourlyRate: number;
  trustScore: number;
  token?: string;
}

const SKILLS_POOL = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express',
  'Python', 'Django', 'Flask', 'JavaScript', 'TypeScript',
  'PHP', 'Laravel', 'Java', 'Go', 'Rust',
  'Mobile Development', 'React Native', 'Flutter', 'Swift', 'Kotlin',
  'DevOps', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'UI Design', 'UX Design', 'Graphic Design', 'Logo Design',
  'SEO', 'Content Marketing', 'Social Media', 'Copywriting',
  'Video Editing', 'Motion Graphics', '3D Modeling',
  'Data Science', 'AI/ML', 'Blockchain', 'Smart Contracts',
];

const CATEGORIES = [
  'Development', 'Design', 'Marketing', 'Writing',
  'Business', 'Video', 'Other'
];

const BIO_TEMPLATES = [
  '{name} is an experienced {skill} professional with a passion for delivering high-quality work. Based in {location}, {pronoun} has helped {number} clients achieve their goals.',
  'Hi! I\'m {name}, a {skill} expert from {location}. I specialize in {skill2} and have {number}+ years of experience.',
  'Professional {skill} developer based in {location}. I focus on {skill2} and {skill3} to deliver exceptional results for my clients.',
  '{name} helps businesses grow through {skill} and {skill2}. With {number}+ successful projects, {pronoun} brings expertise and dedication to every engagement.',
];

async function generateUser(): Promise<SimulatedUser> {
  const displayName = faker.person.fullName();
  const location = `${faker.location.city()}, ${faker.location.country()}`;
  const skills = faker.helpers.arrayElements(SKILLS_POOL, faker.number.int({ min: 3, max: 6 }));
  const hourlyRate = faker.number.int({ min: 25, max: 200 });
  const trustScore = faker.number.int({ min: 45, max: 90 });
  
  const template = faker.helpers.arrayElement(BIO_TEMPLATES);
  const bio = template
    .replace('{name}', displayName)
    .replace('{skill}', skills[0])
    .replace('{skill2}', skills[1] || skills[0])
    .replace('{skill3}', skills[2] || skills[0])
    .replace('{location}', location)
    .replace('{number}', faker.number.int({ min: 3, max: 15 }).toString())
    .replace('{pronoun}', faker.person.sex() === 'male' ? 'he' : 'she');
  
  const firstName = displayName.split(' ')[0].toLowerCase();
  const lastName = displayName.split(' ').slice(-1)[0].toLowerCase();
  const email = `${firstName}.${lastName}${faker.number.int({ min: 1, max: 999 })}@skillvalue-demo.com`;
  
  return {
    email,
    password: 'DemoPass123!',
    displayName,
    bio,
    skills,
    location,
    hourlyRate,
    trustScore,
  };
}

async function createUser(userData: SimulatedUser): Promise<SimulatedUser | null> {
  try {
    // Sign up
    const signupRes = await axios.post(`${API_URL}/auth/signup`, {
      email: userData.email,
      password: userData.password,
      role: 'member',
    });
    
    // Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: userData.email,
      password: userData.password,
    });
    
    const user = {
      ...userData,
      id: signupRes.data?.data?.id || signupRes.data?.id,
      token: loginRes.data?.data?.token || loginRes.data?.token,
    };
    
    console.log(`✅ Created user: ${userData.displayName} (${userData.email})`);
    return user;
  } catch (error: any) {
    if (error.response?.status === 409 || error.message?.includes('already registered')) {
      // User exists, try to login
      try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          email: userData.email,
          password: userData.password,
        });
        console.log(`✅ Logged in existing user: ${userData.displayName}`);
        return {
          ...userData,
          token: loginRes.data?.data?.token || loginRes.data?.token,
        };
      } catch (e) {
        console.error(`❌ Failed to login existing user ${userData.email}`);
        return null;
      }
    }
    console.error(`❌ Failed to create user ${userData.email}:`, error.message);
    return null;
  }
}

async function createOffer(user: SimulatedUser) {
  if (!user.token) return null;
  
  const pricingType = faker.helpers.arrayElement(['fixed', 'hourly', 'negotiable']);
  const price = pricingType === 'hourly' 
    ? faker.number.int({ min: 25, max: 200 })
    : faker.number.int({ min: 500, max: 10000 });
  
  const offer = {
    title: `${user.skills[0]} ${faker.helpers.arrayElement(['Development', 'Design', 'Services', 'Solutions', 'Expert'])} - ${faker.helpers.arrayElement(['Professional', 'Premium', 'Expert', 'Quality'])}`,
    description: `I provide expert ${user.skills.join(', ')} services.

What's Included:
• ${faker.helpers.arrayElement(['Detailed consultation', 'Project planning', 'Requirements analysis', 'Architecture design'])}
• ${faker.helpers.arrayElement(['High-quality deliverables', 'Clean code', 'Best practices', 'Modern solutions'])}
• ${faker.helpers.arrayElement(['Regular updates', 'Clear communication', '24/7 support', 'Quick turnaround'])}
• ${faker.helpers.arrayElement(['Testing & QA', 'Documentation', 'Deployment help', 'Maintenance'])}

Why Choose Me:
• ${faker.number.int({ min: 3, max: 10 })}+ years of experience
• ${faker.number.int({ min: 20, max: 200 })}+ completed projects
• ${faker.number.int({ min: 90, min: 100 })}% client satisfaction
• On-time delivery guaranteed

Ready to start? Let's discuss your project!`,
    price,
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP']),
    pricingType,
    skills: user.skills.slice(0, 4),
    deliveryTime: faker.number.int({ min: 1, max: 30 }),
    category: faker.helpers.arrayElement(CATEGORIES),
  };
  
  try {
    const res = await axios.post(`${API_URL}/offers`, offer, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    console.log(`  📦 Created offer: "${offer.title}"`);
    return res.data;
  } catch (error: any) {
    console.error(`  ❌ Failed to create offer:`, error.message);
    return null;
  }
}

async function createRequest(user: SimulatedUser) {
  if (!user.token) return null;
  
  const requiredSkills = faker.helpers.arrayElements(SKILLS_POOL, faker.number.int({ min: 2, max: 4 }));
  const minBudget = faker.number.int({ min: 500, max: 3000 });
  const maxBudget = minBudget + faker.number.int({ min: 500, max: 7000 });
  
  const request = {
    title: `Need ${requiredSkills.slice(0, 2).join('/')} ${faker.helpers.arrayElement(['Developer', 'Expert', 'Specialist', 'Consultant'])}`,
    description: `Looking for an experienced ${requiredSkills.join('/')} professional for a project.

Project Details:
• ${faker.helpers.arrayElement(['Web application', 'Mobile app', 'Website', 'API development', 'Design system'])}
• ${faker.helpers.arrayElement(['Startup MVP', 'Enterprise solution', 'E-commerce platform', 'SaaS product', 'Marketing website'])}
• ${faker.helpers.arrayElement(['Greenfield project', 'Feature enhancement', 'Bug fixes', 'Migration', 'Redesign'])}

Requirements:
• Strong experience with ${requiredSkills.join(', ')}
• Portfolio of similar projects
• Excellent communication skills
• Available for ${faker.helpers.arrayElement(['full-time', 'part-time', 'as-needed'])} work
• Can start ${faker.helpers.arrayElement(['immediately', 'within a week', 'within 2 weeks'])}

Budget: $${minBudget.toLocaleString()} - $${maxBudget.toLocaleString()}
Timeline: ${faker.helpers.arrayElement(['1-2 weeks', '2-4 weeks', '1-2 months', 'Flexible'])}

Please submit your proposal with relevant experience and portfolio.`,
    budget: {
      min: minBudget,
      max: maxBudget,
      currency: 'USD',
      negotiable: faker.datatype.boolean(),
    },
    skills: requiredSkills,
    urgency: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
    experienceLevel: faker.helpers.arrayElement(['beginner', 'intermediate', 'expert']),
  };
  
  try {
    const res = await axios.post(`${API_URL}/requests`, request, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    console.log(`  📋 Created request: "${request.title}"`);
    return res.data;
  } catch (error: any) {
    console.error(`  ❌ Failed to create request:`, error.message);
    return null;
  }
}

async function createProposal(client: SimulatedUser, offer: any) {
  if (!client.token) return null;
  
  const price = faker.number.int({ min: 1000, max: 5000 });
  const proposal = {
    offerId: offer.id,
    message: `Hi! I'm interested in your offer. I have a project that needs ${offer.skills?.slice(0, 2).join(' and ') || 'development work'}.

I have experience with similar projects and can deliver quality results. My budget is around $${price} and I'd like to complete this within ${faker.number.int({ min: 1, max: 4 })} weeks.

Looking forward to discussing this with you!`,
    price,
    deliveryTime: faker.number.int({ min: 7, max: 28 }),
  };
  
  try {
    const res = await axios.post(`${API_URL}/proposals`, proposal, {
      headers: { Authorization: `Bearer ${client.token}` }
    });
    console.log(`  📄 Created proposal: $${price}`);
    return res.data;
  } catch (error: any) {
    console.error(`  ❌ Failed to create proposal:`, error.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const userCount = parseInt(args.find(a => a.startsWith('--users='))?.split('=')[1] || '10');
  const offerCount = parseInt(args.find(a => a.startsWith('--offers='))?.split('=')[1] || '15');
  const requestCount = parseInt(args.find(a => a.startsWith('--requests='))?.split('=')[1] || '10');
  const proposalCount = parseInt(args.find(a => a.startsWith('--proposals='))?.split('=')[1] || '20');
  
  console.log('🚀 Seed Production Data');
  console.log('=======================');
  console.log(`API: ${API_URL}`);
  console.log(`Users: ${userCount}`);
  console.log(`Offers: ${offerCount}`);
  console.log(`Requests: ${requestCount}`);
  console.log(`Proposals: ${proposalCount}`);
  console.log('');
  
  const users: SimulatedUser[] = [];
  const offers: any[] = [];
  const requests: any[] = [];
  const proposals: any[] = [];
  
  // Phase 1: Create users
  console.log('📌 Phase 1: Creating users...');
  for (let i = 0; i < userCount; i++) {
    const userData = await generateUser();
    const user = await createUser(userData);
    if (user) {
      users.push(user);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log(`✅ Created ${users.length} users\n`);
  
  // Phase 2: Create offers (70% of users create offers)
  console.log('📌 Phase 2: Creating offers...');
  const providers = faker.helpers.shuffle(users).slice(0, Math.floor(users.length * 0.7));
  for (const user of providers) {
    const offer = await createOffer(user);
    if (offer) offers.push(offer);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log(`✅ Created ${offers.length} offers\n`);
  
  // Phase 3: Create requests (50% of users create requests)
  console.log('📌 Phase 3: Creating requests...');
  const requesters = faker.helpers.shuffle(users).slice(0, Math.floor(users.length * 0.5));
  for (const user of requesters) {
    const request = await createRequest(user);
    if (request) requests.push(request);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log(`✅ Created ${requests.length} requests\n`);
  
  // Phase 4: Create proposals
  console.log('📌 Phase 4: Creating proposals...');
  const clients = users.filter(u => !providers.includes(u));
  for (let i = 0; i < Math.min(proposalCount, offers.length); i++) {
    const client = faker.helpers.arrayElement(clients);
    const offer = offers[i];
    const proposal = await createProposal(client, offer);
    if (proposal) proposals.push(proposal);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log(`✅ Created ${proposals.length} proposals\n`);
  
  // Summary
  console.log('🎉 Seed Complete!');
  console.log('==================');
  console.log(`Users: ${users.length}`);
  console.log(`Offers: ${offers.length}`);
  console.log(`Requests: ${requests.length}`);
  console.log(`Proposals: ${proposals.length}`);
  console.log('');
  console.log('Demo credentials:');
  console.log(`  Email: ${users[0]?.email}`);
  console.log(`  Password: DemoPass123!`);
  console.log('');
  console.log('API endpoints:');
  console.log(`  GET  ${API_URL}/offers`);
  console.log(`  GET  ${API_URL}/requests`);
}

main().catch(console.error);
