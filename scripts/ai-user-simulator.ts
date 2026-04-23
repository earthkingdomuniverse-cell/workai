#!/usr/bin/env ts-node
/**
 * AI User Simulator
 * Tạo synthetic users với AI để populate hệ thống với dữ liệu thật
 * 
 * Usage: ts-node scripts/ai-user-simulator.ts --count=10 --actions=create,interact
 */

import { config } from 'dotenv';
config();

import { OpenAI } from 'openai';
import { faker } from '@faker-js/faker';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface SimulatedUser {
  email: string;
  password: string;
  role: 'member' | 'operator' | 'admin';
  profile: {
    displayName: string;
    bio: string;
    skills: string[];
    goals: string[];
    location: string;
    hourlyRate?: number;
  };
  token?: string;
}

interface SimulatedOffer {
  title: string;
  description: string;
  price: number;
  currency: string;
  pricingType: 'fixed' | 'hourly' | 'negotiable';
  skills: string[];
  deliveryTime: number;
  category: string;
}

interface SimulatedRequest {
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
    negotiable: boolean;
  };
  skills: string[];
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
}

/**
 * Tạo profile người dùng realistic bằng AI
 */
async function generateUserProfile(): Promise<SimulatedUser['profile']> {
  const skills = [
    'React', 'Node.js', 'Python', 'AI/ML', 'UI/UX Design', 'Mobile Development',
    'Data Science', 'DevOps', 'Blockchain', 'Content Writing', 'SEO',
    'Marketing', 'Sales', 'Customer Support', 'Project Management',
    'Video Editing', 'Graphic Design', '3D Modeling', 'Translation',
    'Legal Consulting', 'Financial Analysis', 'Business Strategy'
  ];

  const goals = [
    'Build passive income',
    'Work with cutting-edge tech',
    'Help startups grow',
    'Expand professional network',
    'Learn new skills',
    'Achieve financial freedom',
    'Create meaningful products',
    'Become industry expert'
  ];

  const selectedSkills = faker.helpers.arrayElements(skills, faker.number.int({ min: 2, max: 6 }));
  const selectedGoals = faker.helpers.arrayElements(goals, faker.number.int({ min: 1, max: 3 }));

  const displayName = faker.person.fullName();
  const location = `${faker.location.city()}, ${faker.location.country()}`;
  const hourlyRate = faker.number.int({ min: 20, max: 200 });

  // Dùng AI để tạo bio realistic
  const bioPrompt = `Write a professional bio for ${displayName}, a freelancer with skills in ${selectedSkills.join(', ')}. 
    They want to ${selectedGoals.join(', ')}. 
    Bio should be 2-3 sentences, professional but personable, suitable for a marketplace profile.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional profile writer.' },
        { role: 'user', content: bioPrompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const bio = completion.choices[0]?.message?.content?.trim() || 
      `${displayName} is a skilled professional specializing in ${selectedSkills.join(', ')}.`;

    return {
      displayName,
      bio,
      skills: selectedSkills,
      goals: selectedGoals,
      location,
      hourlyRate,
    };
  } catch (error) {
    console.log('OpenAI failed, using fallback bio');
    return {
      displayName,
      bio: `${displayName} is a skilled professional specializing in ${selectedSkills.join(', ')}. 
            Available for ${selectedGoals.join(' and ')}.`,
      skills: selectedSkills,
      goals: selectedGoals,
      location,
      hourlyRate,
    };
  }
}

/**
 * Tạo user và đăng ký
 */
async function createUser(role: 'member' | 'operator' | 'admin' = 'member'): Promise<SimulatedUser> {
  const profile = await generateUserProfile();
  const email = faker.internet.email({ firstName: profile.displayName.split(' ')[0] });
  const password = 'Password123!';

  try {
    const response = await axios.post(`${API_URL}/auth/signup`, {
      email,
      password,
      role,
    });

    console.log(`✅ Created user: ${email} (${role})`);
    
    // Login để lấy token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    return {
      email,
      password,
      role,
      profile,
      token: loginResponse.data.token,
    };
  } catch (error) {
    console.error(`❌ Failed to create user ${email}:`, error.message);
    throw error;
  }
}

/**
 * Tạo offer realistic bằng AI
 */
async function generateOffer(skills: string[]): Promise<SimulatedOffer> {
  const pricingTypes = ['fixed', 'hourly', 'negotiable'] as const;
  const pricingType = faker.helpers.arrayElement(pricingTypes);
  const currencies = ['USD', 'EUR', 'GBP'];
  const currency = faker.helpers.arrayElement(currencies);
  
  let price: number;
  if (pricingType === 'hourly') {
    price = faker.number.int({ min: 20, max: 200 });
  } else {
    price = faker.number.int({ min: 500, max: 10000 });
  }

  // Dùng AI để tạo title và description
  const offerPrompt = `Create a marketplace offer for a freelancer with skills in ${skills.join(', ')}.
    Pricing: ${pricingType} at ${price} ${currency}.
    
    Return JSON with:
    - title: catchy, professional title (5-10 words)
    - description: detailed description of service (100-200 words)
    - category: one of [Development, Design, Writing, Marketing, Consulting, Other]
    - deliveryTime: realistic number of days (1-30)
    
    Make it realistic and compelling.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a marketplace listing expert. Return ONLY valid JSON.' },
        { role: 'user', content: offerPrompt }
      ],
      max_tokens: 400,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const aiOffer = JSON.parse(content);
      return {
        title: aiOffer.title,
        description: aiOffer.description,
        price,
        currency,
        pricingType,
        skills: skills.slice(0, 4),
        deliveryTime: aiOffer.deliveryTime || faker.number.int({ min: 1, max: 30 }),
        category: aiOffer.category || 'Development',
      };
    }
  } catch (error) {
    console.log('OpenAI offer generation failed, using fallback');
  }

  // Fallback
  return {
    title: `${skills[0]} Development Services - Professional & Fast`,
    description: `I offer expert ${skills.join(', ')} development services. 
      With years of experience, I deliver high-quality solutions tailored to your needs.
      Let me help you bring your project to life!`,
    price,
    currency,
    pricingType,
    skills: skills.slice(0, 4),
    deliveryTime: faker.number.int({ min: 3, max: 14 }),
    category: 'Development',
  };
}

/**
 * Tạo offer cho user
 */
async function createOffer(user: SimulatedUser): Promise<void> {
  if (!user.token) return;

  const offer = await generateOffer(user.profile.skills);

  try {
    await axios.post(
      `${API_URL}/offers`,
      offer,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    console.log(`✅ Created offer: "${offer.title}" for ${user.profile.displayName}`);
  } catch (error) {
    console.error(`❌ Failed to create offer:`, error.message);
  }
}

/**
 * Tạo request realistic bằng AI
 */
async function generateRequest(): Promise<SimulatedRequest> {
  const allSkills = [
    'React', 'Node.js', 'Python', 'AI/ML', 'UI/UX', 'Mobile', 'DevOps',
    'Writing', 'SEO', 'Marketing', 'Design', 'Video Editing'
  ];
  const selectedSkills = faker.helpers.arrayElements(allSkills, faker.number.int({ min: 2, max: 5 }));
  
  const urgencies = ['low', 'medium', 'high', 'urgent'] as const;
  const experienceLevels = ['beginner', 'intermediate', 'expert'] as const;

  const minBudget = faker.number.int({ min: 500, max: 5000 });
  const maxBudget = minBudget + faker.number.int({ min: 500, max: 10000 });

  // Dùng AI để tạo title và description
  const requestPrompt = `Create a realistic request for a client who needs help with ${selectedSkills.join(', ')}.
    Budget: $${minBudget}-${maxBudget}.
    
    Return JSON with:
    - title: clear project title (5-12 words)
    - description: detailed project description including requirements, timeline, deliverables (150-250 words)
    
    Make it realistic and professional.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a client writing a project brief. Return ONLY valid JSON.' },
        { role: 'user', content: requestPrompt }
      ],
      max_tokens: 400,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const aiRequest = JSON.parse(content);
      return {
        title: aiRequest.title,
        description: aiRequest.description,
        budget: {
          min: minBudget,
          max: maxBudget,
          currency: 'USD',
          negotiable: faker.datatype.boolean(),
        },
        skills: selectedSkills,
        urgency: faker.helpers.arrayElement(urgencies),
        experienceLevel: faker.helpers.arrayElement(experienceLevels),
      };
    }
  } catch (error) {
    console.log('OpenAI request generation failed, using fallback');
  }

  // Fallback
  return {
    title: `Need ${selectedSkills.join('/')} Developer for Project`,
    description: `Looking for an experienced developer to help with a project involving ${selectedSkills.join(', ')}. 
      The project requires professional quality work delivered on time.
      Please submit your proposal with relevant experience and timeline.`,
    budget: {
      min: minBudget,
      max: maxBudget,
      currency: 'USD',
      negotiable: true,
    },
    skills: selectedSkills,
    urgency: faker.helpers.arrayElement(urgencies),
    experienceLevel: faker.helpers.arrayElement(experienceLevels),
  };
}

/**
 * Tạo request cho user
 */
async function createRequest(user: SimulatedUser): Promise<void> {
  if (!user.token) return;

  const request = await generateRequest();

  try {
    await axios.post(
      `${API_URL}/requests`,
      request,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    console.log(`✅ Created request: "${request.title}" by ${user.profile.displayName}`);
  } catch (error) {
    console.error(`❌ Failed to create request:`, error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const userCount = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '5');
  const actions = args.find(a => a.startsWith('--actions='))?.split('=')[1]?.split(',') || ['create', 'interact'];

  console.log('🤖 AI User Simulator Starting...\n');
  console.log(`Target: ${userCount} users`);
  console.log(`Actions: ${actions.join(', ')}\n`);

  const users: SimulatedUser[] = [];

  // Phase 1: Create users
  if (actions.includes('create')) {
    console.log('=== Phase 1: Creating Users ===');
    for (let i = 0; i < userCount; i++) {
      try {
        const user = await createUser('member');
        users.push(user);
        
        // Create offers (70% of users are providers)
        if (Math.random() > 0.3) {
          await createOffer(user);
        }

        // Create requests (50% of users post requests)
        if (Math.random() > 0.5) {
          await createRequest(user);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Failed to create user:', error);
      }
    }
  }

  console.log(`\n✅ Simulation complete!`);
  console.log(`Created ${users.length} users with realistic profiles`);
  console.log(`API URL: ${API_URL}`);
}

main().catch(console.error);
