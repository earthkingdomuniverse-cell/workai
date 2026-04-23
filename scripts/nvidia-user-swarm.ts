#!/usr/bin/env tsx
/**
 * NVIDIA User Swarm Generator
 * Tạo bầy đàn user đa dạng với NVIDIA AI models
 * 
 * Mô hình sử dụng:
 * - meta/llama-3.1-nemotron-70b-instruct: User profiles, bios
 * - mistralai/mixtral-8x22b-instruct-v0.1: Offers & requests
 * - google/gemma-2-27b-it: Reviews & messages
 * - nvidia/nemotron-4-340b-instruct: Trust scores & analysis
 * 
 * Usage: 
 *   npx tsx scripts/nvidia-user-swarm.ts --count=100 --batch=10
 *   npx tsx scripts/nvidia-user-swarm.ts --count=500 --swarm-mode
 */

import { config } from 'dotenv';
config();

import { faker } from '@faker-js/faker';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

// NVIDIA Models
const MODELS = {
  NEMOTRON_70B: 'meta/llama-3.1-nemotron-70b-instruct',
  MIXTRAL_8X22B: 'mistralai/mixtral-8x22b-instruct-v0.1',
  GEMMA_27B: 'google/gemma-2-27b-it',
  NEMOTRON_340B: 'nvidia/nemotron-4-340b-instruct',
  LLAMA_3_1_405B: 'meta/llama-3.1-405b-instruct',
  MISTRAL_LARGE: 'mistralai/mistral-large',
  CODELLAMA_70B: 'meta/codellama-70b',
};

interface SwarmConfig {
  totalUsers: number;
  batchSize: number;
  concurrency: number;
  useNvidiaAI: boolean;
  enableDeals: boolean;
  enableReviews: boolean;
  personaDistribution: {
    developers: number;
    designers: number;
    marketers: number;
    writers: number;
    consultants: number;
    beginners: number;
    experts: number;
  };
}

interface GeneratedPersona {
  displayName: string;
  email: string;
  password: string;
  role: 'provider' | 'client' | 'hybrid';
  bio: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  trustScore: number;
  persona: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  specialty: string;
}

// Persona templates with weighted distributions
const PERSONA_TEMPLATES = [
  // Developers (30%)
  { type: 'developer', subtype: 'frontend', weight: 10, skills: ['React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript'] },
  { type: 'developer', subtype: 'backend', weight: 8, skills: ['Node.js', 'Python', 'Java', 'Go', 'Rust'] },
  { type: 'developer', subtype: 'fullstack', weight: 7, skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS'] },
  { type: 'developer', subtype: 'mobile', weight: 5, skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'] },
  
  // Designers (15%)
  { type: 'designer', subtype: 'ui', weight: 5, skills: ['UI Design', 'Figma', 'Adobe XD', 'Prototyping'] },
  { type: 'designer', subtype: 'ux', weight: 5, skills: ['UX Research', 'User Testing', 'Wireframing', 'Design Systems'] },
  { type: 'designer', subtype: 'graphic', weight: 5, skills: ['Graphic Design', 'Illustration', 'Branding', 'Photoshop'] },
  
  // Marketers (12%)
  { type: 'marketer', subtype: 'digital', weight: 4, skills: ['Digital Marketing', 'SEO', 'SEM', 'Analytics'] },
  { type: 'marketer', subtype: 'content', weight: 4, skills: ['Content Marketing', 'Copywriting', 'Social Media', 'Email Marketing'] },
  { type: 'marketer', subtype: 'growth', weight: 4, skills: ['Growth Hacking', 'CRO', 'A/B Testing', 'Data Analysis'] },
  
  // Writers (10%)
  { type: 'writer', subtype: 'content', weight: 4, skills: ['Content Writing', 'Blogging', 'SEO Writing', 'Research'] },
  { type: 'writer', subtype: 'technical', weight: 3, skills: ['Technical Writing', 'Documentation', 'API Docs', 'Tutorials'] },
  { type: 'writer', subtype: 'creative', weight: 3, skills: ['Creative Writing', 'Copywriting', 'Script Writing', 'Editing'] },
  
  // Consultants (8%)
  { type: 'consultant', subtype: 'business', weight: 3, skills: ['Business Strategy', 'Market Research', 'Financial Analysis'] },
  { type: 'consultant', subtype: 'legal', weight: 2, skills: ['Legal Consulting', 'Contract Review', 'Compliance'] },
  { type: 'consultant', subtype: 'tech', weight: 3, skills: ['Technical Consulting', 'Architecture', 'DevOps'] },
  
  // AI/Data (15%)
  { type: 'ai', subtype: 'ml', weight: 5, skills: ['Machine Learning', 'Python', 'TensorFlow', 'PyTorch'] },
  { type: 'ai', subtype: 'data', weight: 5, skills: ['Data Science', 'SQL', 'Python', 'Visualization'] },
  { type: 'ai', subtype: 'nlp', weight: 5, skills: ['NLP', 'LLM', 'Prompt Engineering', 'Python'] },
  
  // Video/Media (10%)
  { type: 'video', subtype: 'editor', weight: 4, skills: ['Video Editing', 'Premiere Pro', 'After Effects'] },
  { type: 'video', subtype: 'motion', weight: 3, skills: ['Motion Graphics', 'Animation', '3D Design'] },
  { type: 'video', subtype: 'producer', weight: 3, skills: ['Video Production', 'Filmmaking', 'Sound Design'] },
];

// Location pools with weights
const LOCATIONS = [
  { city: 'San Francisco', country: 'USA', weight: 15 },
  { city: 'New York', country: 'USA', weight: 12 },
  { city: 'London', country: 'UK', weight: 10 },
  { city: 'Berlin', country: 'Germany', weight: 8 },
  { city: 'Toronto', country: 'Canada', weight: 8 },
  { city: 'Singapore', country: 'Singapore', weight: 7 },
  { city: 'Sydney', country: 'Australia', weight: 6 },
  { city: 'Amsterdam', country: 'Netherlands', weight: 5 },
  { city: 'Stockholm', country: 'Sweden', weight: 5 },
  { city: 'Dublin', country: 'Ireland', weight: 4 },
  { city: 'Austin', country: 'USA', weight: 4 },
  { city: 'Seattle', country: 'USA', weight: 4 },
  { city: 'Barcelona', country: 'Spain', weight: 3 },
  { city: 'Paris', country: 'France', weight: 3 },
  { city: 'Tel Aviv', country: 'Israel', weight: 3 },
  { city: 'Bangalore', country: 'India', weight: 3 },
  { city: 'Tokyo', country: 'Japan', weight: 2 },
  { city: 'Remote', country: 'Worldwide', weight: 20 },
];

/**
 * Call NVIDIA API with specific model
 */
async function callNvidiaAPI(
  model: string,
  prompt: string,
  maxTokens: number = 500,
  temperature: number = 0.8
): Promise<string> {
  if (!NVIDIA_API_KEY) {
    console.log('⚠️  No NVIDIA_API_KEY, using fallback');
    return '';
  }

  try {
    const response = await axios.post(
      `${NVIDIA_BASE_URL}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
        top_p: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data.choices[0]?.message?.content?.trim() || '';
  } catch (error: any) {
    console.error(`❌ NVIDIA API error (${model}):`, error.message);
    return '';
  }
}

/**
 * Generate persona with NVIDIA Nemotron 70B
 */
async function generatePersonaWithNVIDIA(
  type: string,
  subtype: string,
  baseSkills: string[]
): Promise<Partial<GeneratedPersona>> {
  const displayName = faker.person.fullName();
  const locationPool = LOCATIONS.flatMap(l => Array(l.weight).fill(l));
  const location = faker.helpers.arrayElement(locationPool);
  const experience = faker.helpers.arrayElement(['beginner', 'intermediate', 'expert'] as const);
  
  // Generate bio with Nemotron 70B
  const bioPrompt = `Write a professional bio for ${displayName}, a ${experience} ${type} specializing in ${subtype}.
Skills: ${baseSkills.join(', ')}.
Location: ${location.city}, ${location.country}.

Bio should be 2-3 sentences, professional but personable. Include:
- What they specialize in
- Their approach to work
- What makes them unique

Return ONLY the bio text, no JSON, no markdown.`;

  let bio = await callNvidiaAPI(MODELS.NEMOTRON_70B, bioPrompt, 150, 0.7);
  
  // Fallback if NVIDIA fails
  if (!bio) {
    const templates = [
      `${displayName} is an experienced ${type} based in ${location.city}, ${location.country}. Specializing in ${baseSkills.slice(0, 2).join(' and ')}, they deliver high-quality work with attention to detail.`,
      `Hi! I'm ${displayName}, a ${experience} ${type} from ${location.city}. I help clients achieve their goals through ${baseSkills[0]} and ${baseSkills[1]}.`,
      `${displayName} brings expertise in ${baseSkills.join(', ')} to every project. Based in ${location.city}, they focus on delivering results that exceed expectations.`,
    ];
    bio = faker.helpers.arrayElement(templates);
  }

  // Generate skills variation with Mixtral
  const skillsPrompt = `Given a ${type} who specializes in ${subtype}, suggest 3-5 specific skills they might have.
Base skills: ${baseSkills.join(', ')}

Return ONLY a comma-separated list of skills, no other text.`;

  let skillsResponse = await callNvidiaAPI(MODELS.MIXTRAL_8X22B, skillsPrompt, 100, 0.6);
  let skills = skillsResponse ? skillsResponse.split(',').map(s => s.trim()).filter(Boolean) : baseSkills;
  if (skills.length === 0) skills = baseSkills;

  // Generate hourly rate based on experience and type
  const baseRate = {
    beginner: { min: 15, max: 50 },
    intermediate: { min: 40, max: 120 },
    expert: { min: 100, max: 300 },
  }[experience];
  
  const hourlyRate = faker.number.int(baseRate);
  
  // Generate trust score with some randomness
  const baseTrust = { beginner: 50, intermediate: 70, expert: 85 }[experience];
  const trustScore = Math.min(100, Math.max(40, baseTrust + faker.number.int({ min: -10, max: 15 })));

  return {
    displayName,
    bio,
    skills,
    location: `${location.city}, ${location.country}`,
    hourlyRate,
    trustScore,
    experience,
    persona: `${experience}_${type}_${subtype}`,
    specialty: subtype,
  };
}

/**
 * Generate offer content with Mixtral
 */
async function generateOfferContent(persona: GeneratedPersona): Promise<{ title: string; description: string }> {
  const prompt = `Create a marketplace offer for a ${persona.experience} ${persona.specialty} professional.
Name: ${persona.displayName}
Skills: ${persona.skills.join(', ')}
Rate: $${persona.hourlyRate}/hour
Location: ${persona.location}

Return JSON:
{
  "title": "Catchy professional title (6-10 words)",
  "description": "Detailed description (200-300 words). Include: what's offered, what's included, why choose them, experience level. Professional tone."
}

Return ONLY valid JSON, no markdown.`;

  const response = await callNvidiaAPI(MODELS.MIXTRAL_8X22B, prompt, 500, 0.8);
  
  try {
    const content = JSON.parse(response);
    return {
      title: content.title,
      description: content.description,
    };
  } catch {
    // Fallback
    return {
      title: `Professional ${persona.skills[0]} ${faker.helpers.arrayElement(['Services', 'Solutions', 'Expert', 'Developer'])}`,
      description: `I provide expert ${persona.skills.join(', ')} services. With ${faker.number.int({ min: 2, max: 10 })}+ years of experience, I deliver high-quality results on time and within budget.\n\nWhat's included:\n• Detailed project analysis\n• Clean, professional deliverables\n• Regular communication\n• Post-delivery support\n\nLet's discuss your project!`,
    };
  }
}

/**
 * Generate request content with Gemma
 */
async function generateRequestContent(skills: string[]): Promise<{ title: string; description: string }> {
  const prompt = `Create a realistic project request for a client who needs: ${skills.join(', ')}.

Return JSON:
{
  "title": "Clear project title (5-10 words)",
  "description": "Detailed description (150-250 words). Include: project overview, requirements, timeline, budget expectations, ideal candidate."
}

Return ONLY valid JSON.`;

  const response = await callNvidiaAPI(MODELS.GEMMA_27B, prompt, 400, 0.7);
  
  try {
    const content = JSON.parse(response);
    return {
      title: content.title,
      description: content.description,
    };
  } catch {
    return {
      title: `Need ${skills.slice(0, 2).join('/')} Professional`,
      description: `Looking for an experienced ${skills.join(', ')} professional for a project.\n\nRequirements:\n• Strong portfolio\n• Good communication\n• Available immediately\n• Detail-oriented\n\nBudget and timeline flexible for the right candidate.`,
    };
  }
}

/**
 * Create user via API
 */
async function createUser(persona: Partial<GeneratedPersona>): Promise<GeneratedPersona | null> {
  const firstName = persona.displayName?.split(' ')[0].toLowerCase() || 'user';
  const lastName = persona.displayName?.split(' ').slice(-1)[0].toLowerCase() || 'demo';
  const email = `${firstName}.${lastName}${faker.number.int({ min: 1, max: 999 })}@swarm.skillvalue.ai`;
  const password = 'SwarmPass123!';

  try {
    // Sign up
    const signupRes = await axios.post(`${API_URL}/auth/signup`, {
      email,
      password,
      role: 'member',
    });

    // Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    const user = {
      ...persona,
      email,
      password,
      token: loginRes.data?.data?.token || loginRes.data?.token,
    } as GeneratedPersona;

    return user;
  } catch (error: any) {
    if (error.response?.status === 409) {
      // User exists, try login
      try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });
        return {
          ...persona,
          email,
          password,
          token: loginRes.data?.data?.token || loginRes.data?.token,
        } as GeneratedPersona;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Create offer for user
 */
async function createOffer(user: GeneratedPersona): Promise<any> {
  if (!user.token) return null;

  const content = await generateOfferContent(user);
  const pricingType = faker.helpers.arrayElement(['fixed', 'hourly', 'negotiable']);
  const price = pricingType === 'hourly' 
    ? user.hourlyRate
    : faker.number.int({ min: 500, max: 10000 });

  const offer = {
    title: content.title,
    description: content.description,
    price,
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP']),
    pricingType,
    skills: user.skills.slice(0, 4),
    deliveryTime: faker.number.int({ min: 1, max: 30 }),
    category: faker.helpers.arrayElement(['Development', 'Design', 'Marketing', 'Writing', 'Business', 'Video']),
  };

  try {
    const res = await axios.post(`${API_URL}/offers`, offer, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Create request for user
 */
async function createRequest(user: GeneratedPersona): Promise<any> {
  if (!user.token) return null;

  const allSkills = Object.values(PERSONA_TEMPLATES).flatMap(p => p.skills);
  const requiredSkills = faker.helpers.arrayElements(allSkills, faker.number.int({ min: 2, max: 4 }));
  const content = await generateRequestContent(requiredSkills);
  
  const minBudget = faker.number.int({ min: 500, max: 5000 });
  const maxBudget = minBudget + faker.number.int({ min: 500, max: 10000 });

  const request = {
    title: content.title,
    description: content.description,
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
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Process batch of users
 */
async function processBatch(
  batchNumber: number,
  batchSize: number,
  useNvidiaAI: boolean
): Promise<GeneratedPersona[]> {
  console.log(`\n📦 Processing Batch ${batchNumber} (${batchSize} users)...`);
  
  const users: GeneratedPersona[] = [];
  
  for (let i = 0; i < batchSize; i++) {
    // Select persona template
    const weightedPool = PERSONA_TEMPLATES.flatMap(p => 
      Array(p.weight).fill(p)
    );
    const template = faker.helpers.arrayElement(weightedPool);
    
    // Generate persona
    let personaData: Partial<GeneratedPersona>;
    if (useNvidiaAI && NVIDIA_API_KEY) {
      personaData = await generatePersonaWithNVIDIA(
        template.type,
        template.subtype,
        template.skills
      );
    } else {
      // Fallback to faker
const locationPool = LOCATIONS.flatMap(l => Array(l.weight).fill(l));
    const location = faker.helpers.arrayElement(locationPool);
      personaData = {
        displayName: faker.person.fullName(),
        bio: faker.lorem.paragraph(2),
        skills: template.skills,
        location: `${location.city}, ${location.country}`,
        hourlyRate: faker.number.int({ min: 25, max: 200 }),
        trustScore: faker.number.int({ min: 45, max: 90 }),
        experience: faker.helpers.arrayElement(['beginner', 'intermediate', 'expert']),
        persona: `${template.type}_${template.subtype}`,
        specialty: template.subtype,
      };
    }

    // Create user
    const user = await createUser(personaData);
    if (user) {
      users.push(user);
      process.stdout.write(`✅ `);
    } else {
      process.stdout.write(`❌ `);
    }
    
    // Delay between users
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n   Created ${users.length}/${batchSize} users`);
  return users;
}

/**
 * Main swarm generator
 */
async function main() {
  const args = process.argv.slice(2);
  const config: SwarmConfig = {
    totalUsers: parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '50'),
    batchSize: parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '10'),
    concurrency: parseInt(args.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '3'),
    useNvidiaAI: !args.includes('--no-ai'),
    enableDeals: args.includes('--deals'),
    enableReviews: args.includes('--reviews'),
    personaDistribution: {
      developers: 30,
      designers: 15,
      marketers: 12,
      writers: 10,
      consultants: 8,
      beginners: 20,
      experts: 25,
    },
  };

  console.log('🚀 NVIDIA USER SWARM GENERATOR');
  console.log('==============================');
  console.log(`Total Users: ${config.totalUsers}`);
  console.log(`Batch Size: ${config.batchSize}`);
  console.log(`Batches: ${Math.ceil(config.totalUsers / config.batchSize)}`);
  console.log(`NVIDIA AI: ${config.useNvidiaAI ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`API: ${API_URL}`);
  if (config.useNvidiaAI && !NVIDIA_API_KEY) {
    console.log('\n⚠️  WARNING: NVIDIA_API_KEY not set, will use fallback');
  }
  console.log('');

  const batches = Math.ceil(config.totalUsers / config.batchSize);
  const allUsers: GeneratedPersona[] = [];
  const allOffers: any[] = [];
  const allRequests: any[] = [];

  // Generate users in batches
  for (let i = 0; i < batches; i++) {
    const batchSize = Math.min(config.batchSize, config.totalUsers - (i * config.batchSize));
    const users = await processBatch(i + 1, batchSize, config.useNvidiaAI);
    allUsers.push(...users);
    
    // Delay between batches
    if (i < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📦 Creating offers & requests...');
  
  // Create offers (70% of users)
  const providers = faker.helpers.shuffle(allUsers).slice(0, Math.floor(allUsers.length * 0.7));
  for (const user of providers) {
    const offer = await createOffer(user);
    if (offer) {
      allOffers.push(offer);
      process.stdout.write(`📦 `);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Create requests (50% of users)
  const requesters = faker.helpers.shuffle(allUsers).slice(0, Math.floor(allUsers.length * 0.5));
  for (const user of requesters) {
    const request = await createRequest(user);
    if (request) {
      allRequests.push(request);
      process.stdout.write(`📋 `);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Summary
  console.log('\n\n🎉 SWARM GENERATION COMPLETE!');
  console.log('============================');
  console.log(`Users Created: ${allUsers.length}`);
  console.log(`Offers Created: ${allOffers.length}`);
  console.log(`Requests Created: ${allRequests.length}`);
  console.log('');
  
  // Persona breakdown
  const personaCounts: Record<string, number> = {};
  allUsers.forEach(u => {
    const key = u.persona || 'unknown';
    personaCounts[key] = (personaCounts[key] || 0) + 1;
  });
  
  console.log('Persona Distribution:');
  Object.entries(personaCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([persona, count]) => {
      console.log(`  ${persona}: ${count}`);
    });
  
  console.log('\nDemo Credentials:');
  if (allUsers.length > 0) {
    console.log(`  Email: ${allUsers[0].email}`);
    console.log(`  Password: ${allUsers[0].password}`);
  }
  console.log(`\nAPI: ${API_URL}/offers`);
}

main().catch(console.error);
