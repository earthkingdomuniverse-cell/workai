#!/usr/bin/env ts-node
/**
 * Production Seed Script
 * Tạo dữ liệu thật cho production launch
 * 
 * Usage: 
 *   ts-node scripts/production-seed.ts --env=production --users=50 --deals=20
 *   ts-node scripts/production-seed.ts --env=staging --users=10 --deals=5
 */

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface SeedConfig {
  userCount: number;
  offerCount: number;
  requestCount: number;
  dealCount: number;
  proposalCount: number;
  reviewCount: number;
  env: 'development' | 'staging' | 'production';
}

const DEFAULT_CONFIG: SeedConfig = {
  userCount: 20,
  offerCount: 30,
  requestCount: 20,
  dealCount: 10,
  proposalCount: 25,
  reviewCount: 15,
  env: 'staging',
};

// Skills taxonomy
const SKILLS_TAXONOMY = {
  development: [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express',
    'Python', 'Django', 'Flask', 'FastAPI', 'JavaScript', 'TypeScript',
    'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'Java', 'Spring',
    'C#', '.NET', 'Mobile Development', 'React Native', 'Flutter',
    'iOS Development', 'Android Development', 'Swift', 'Kotlin',
    'DevOps', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
    'CI/CD', 'Terraform', 'Ansible', 'GraphQL', 'REST API',
    'Web3', 'Solidity', 'Smart Contracts', 'Blockchain',
    'AI/ML', 'TensorFlow', 'PyTorch', 'Data Science', 'NLP',
  ],
  design: [
    'UI Design', 'UX Design', 'Product Design', 'Graphic Design',
    'Logo Design', 'Brand Identity', 'Motion Graphics', '3D Modeling',
    'Figma', 'Sketch', 'Adobe Creative Suite', 'Blender', 'Cinema 4D',
    'Web Design', 'Mobile App Design', 'Design Systems', 'Prototyping',
    'User Research', 'Wireframing', 'Illustration', 'Animation',
  ],
  marketing: [
    'Digital Marketing', 'SEO', 'SEM', 'Content Marketing',
    'Social Media Marketing', 'Email Marketing', 'Marketing Strategy',
    'Growth Hacking', 'Analytics', 'Google Ads', 'Facebook Ads',
    'LinkedIn Ads', 'Influencer Marketing', 'Affiliate Marketing',
    'Brand Strategy', 'Public Relations', 'Copywriting',
  ],
  writing: [
    'Content Writing', 'Technical Writing', 'Copywriting', 'Blogging',
    'Ghostwriting', 'Editing', 'Proofreading', 'Translation',
    'Creative Writing', 'Script Writing', 'Resume Writing',
    'Academic Writing', 'Grant Writing', 'White Papers',
  ],
  business: [
    'Business Strategy', 'Financial Analysis', 'Accounting', 'Bookkeeping',
    'Project Management', 'Agile', 'Scrum', 'Product Management',
    'HR Consulting', 'Legal Consulting', 'Tax Consulting',
    'Market Research', 'Competitive Analysis', 'Sales',
    'Customer Support', 'Virtual Assistant', 'Data Entry',
  ],
  video: [
    'Video Editing', 'Video Production', 'Motion Graphics',
    'Color Grading', 'Sound Design', 'Videography',
    'YouTube Editing', 'TikTok Editing', 'Reels Editing',
    'Animation', '2D Animation', '3D Animation',
    ' explainer Videos', 'Commercial Production',
  ],
};

const CATEGORIES = [
  'Development', 'Design', 'Marketing', 'Writing', 
  'Business', 'Video', 'Music', 'Photography', 'Other'
];

const PRICING_TYPES = ['fixed', 'hourly', 'negotiable'] as const;
const URGENCY_LEVELS = ['low', 'medium', 'high', 'urgent'] as const;
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'expert'] as const;

/**
 * Generate realistic user profile with AI
 */
async function generateUserProfile() {
  const allSkills = Object.values(SKILLS_TAXONOMY).flat();
  const userSkills = faker.helpers.arrayElements(allSkills, faker.number.int({ min: 3, max: 8 }));
  
  const displayName = faker.person.fullName();
  const location = `${faker.location.city()}, ${faker.location.country()}`;
  const hourlyRate = faker.number.int({ min: 25, max: 250 });
  
  // Generate bio with AI
  const prompt = `Write a professional bio for ${displayName}, a freelancer with skills in ${userSkills.slice(0, 4).join(', ')}. 
    They are based in ${location} and charge $${hourlyRate}/hour.
    Bio should be 2-3 sentences, professional but personable, suitable for a marketplace profile.
    Include what they specialize in and their work ethic.`;
  
  let bio: string;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional profile writer.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    bio = completion.choices[0]?.message?.content?.trim() || 
      `${displayName} is a skilled professional specializing in ${userSkills.join(', ')}.`;
  } catch {
    bio = `${displayName} is an experienced ${userSkills[0]} professional based in ${location}. 
      With a focus on quality and client satisfaction, they deliver excellent results on time and within budget.`;
  }
  
  return {
    displayName,
    bio,
    skills: userSkills,
    location,
    hourlyRate,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`,
  };
}

/**
 * Generate realistic offer with AI
 */
async function generateOffer(skills: string[], userId: string) {
  const pricingType = faker.helpers.arrayElement(PRICING_TYPES);
  const currency = faker.helpers.arrayElement(['USD', 'EUR', 'GBP']);
  const category = faker.helpers.arrayElement(CATEGORIES);
  
  const price = pricingType === 'hourly' 
    ? faker.number.int({ min: 25, max: 200 })
    : faker.number.int({ min: 500, max: 10000 });
  
  const deliveryTime = faker.number.int({ min: 1, max: 30 });
  
  // Generate title and description with AI
  const prompt = `Create a compelling marketplace offer for a freelancer with skills in ${skills.slice(0, 3).join(', ')}.
    Pricing: ${pricingType} at ${price} ${currency}.
    Delivery: ${deliveryTime} days.
    
    Return JSON with:
    - title: catchy, professional title (5-10 words)
    - description: detailed service description including what's included, process, and why hire them (150-250 words)
    
    Make it realistic and compelling for clients.`;
  
  let title: string, description: string;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a marketplace listing expert. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });
    const content = JSON.parse(completion.choices[0]?.message?.content || '{}');
    title = content.title || `${skills[0]} Development Services`;
    description = content.description || `Professional ${skills.join(', ')} services.`;
  } catch {
    title = `Professional ${skills[0]} Development & Consulting`;
    description = `I offer expert ${skills.join(', ')} development services tailored to your needs.
      
      What's included:
      • Detailed project analysis and planning
      • Clean, maintainable code
      • Regular updates and communication
      • Testing and quality assurance
      • Post-launch support
      
      Why work with me:
      • ${faker.number.int({ min: 3, max: 10 })}+ years of experience
      • ${faker.number.int({ min: 50, max: 500 })}+ successful projects
      • Client-focused approach
      • On-time delivery
      
      Let's discuss your project!`;
  }
  
  return {
    id: faker.string.uuid(),
    userId,
    title,
    description,
    price,
    currency,
    pricingType,
    skills: skills.slice(0, 5),
    deliveryTime,
    category,
    status: 'published',
    views: faker.number.int({ min: 0, max: 500 }),
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate realistic request with AI
 */
async function generateRequest(userId: string) {
  const allSkills = Object.values(SKILLS_TAXONOMY).flat();
  const requiredSkills = faker.helpers.arrayElements(allSkills, faker.number.int({ min: 2, max: 5 }));
  
  const minBudget = faker.number.int({ min: 500, max: 5000 });
  const maxBudget = minBudget + faker.number.int({ min: 500, max: 10000 });
  const urgency = faker.helpers.arrayElement(URGENCY_LEVELS);
  const experienceLevel = faker.helpers.arrayElement(EXPERIENCE_LEVELS);
  
  const prompt = `Create a realistic project request for a client who needs help with ${requiredSkills.join(', ')}.
    Budget: $${minBudget}-${maxBudget}
    Urgency: ${urgency}
    Experience Level Required: ${experienceLevel}
    
    Return JSON with:
    - title: clear project title (5-12 words)
    - description: detailed project description including requirements, timeline, deliverables, and ideal candidate (200-300 words)
    
    Make it professional and realistic.`;
  
  let title: string, description: string;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a client writing a project brief. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    const content = JSON.parse(completion.choices[0]?.message?.content || '{}');
    title = content.title || `Need ${requiredSkills[0]} Developer`;
    description = content.description || `Looking for ${requiredSkills.join(', ')} help.`;
  } catch {
    title = `Looking for ${requiredSkills.slice(0, 2).join('/')} Expert`;
    description = `We are looking for an experienced ${requiredSkills.join('/')} professional to help with a project.
      
      Project Overview:
      We need someone who can deliver high-quality work within our timeline and budget.
      
      Requirements:
      • Strong experience with ${requiredSkills.join(', ')}
      • ${experienceLevel} level or higher
      • Excellent communication skills
      • Portfolio of similar projects
      • Available to start ${urgency === 'urgent' ? 'immediately' : 'within a week'}
      
      Budget: $${minBudget.toLocaleString()} - $${maxBudget.toLocaleString()}
      Timeline: ${urgency === 'urgent' ? 'ASAP' : '2-4 weeks'}
      
      Please submit your proposal with relevant experience and examples of similar work.`;
  }
  
  return {
    id: faker.string.uuid(),
    userId,
    title,
    description,
    budgetMin: minBudget,
    budgetMax: maxBudget,
    currency: 'USD',
    negotiable: faker.datatype.boolean(),
    skills: requiredSkills,
    urgency,
    experienceLevel,
    status: 'open',
    createdAt: faker.date.recent({ days: 60 }).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Seed users
 */
async function seedUsers(count: number) {
  console.log(`\n📝 Seeding ${count} users...`);
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const email = `demo.user${i + 1}@skillvalue.ai`;
    const password = 'DemoPass123!';
    
    const profile = await generateUserProfile();
    
    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayName: profile.displayName,
          role: 'member',
          trustScore: faker.number.int({ min: 40, max: 85 }),
          ...profile,
        },
      },
    });
    
    if (error) {
      console.error(`❌ Failed to create user ${email}:`, error.message);
      continue;
    }
    
    if (user.user) {
      users.push({
        id: user.user.id,
        email,
        ...profile,
      });
      console.log(`✅ Created user: ${profile.displayName} (${email})`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`✅ Created ${users.length} users`);
  return users;
}

/**
 * Seed offers
 */
async function seedOffers(count: number, users: any[]) {
  console.log(`\n📦 Seeding ${count} offers...`);
  const offers = [];
  
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);
    const offer = await generateOffer(user.skills, user.id);
    
    const { data, error } = await supabase
      .from('offers')
      .insert(offer)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Failed to create offer:`, error.message);
      continue;
    }
    
    offers.push(data);
    console.log(`✅ Created offer: "${offer.title}" by ${user.displayName}`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Created ${offers.length} offers`);
  return offers;
}

/**
 * Seed requests
 */
async function seedRequests(count: number, users: any[]) {
  console.log(`\n📋 Seeding ${count} requests...`);
  const requests = [];
  
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);
    const request = await generateRequest(user.id);
    
    const { data, error } = await supabase
      .from('requests')
      .insert(request)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Failed to create request:`, error.message);
      continue;
    }
    
    requests.push(data);
    console.log(`✅ Created request: "${request.title}" by ${user.displayName}`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Created ${requests.length} requests`);
  return requests;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  const config: SeedConfig = {
    userCount: parseInt(args.find(a => a.startsWith('--users='))?.split('=')[1] || '10'),
    offerCount: parseInt(args.find(a => a.startsWith('--offers='))?.split('=')[1] || '15'),
    requestCount: parseInt(args.find(a => a.startsWith('--requests='))?.split('=')[1] || '10'),
    dealCount: parseInt(args.find(a => a.startsWith('--deals='))?.split('=')[1] || '5'),
    proposalCount: parseInt(args.find(a => a.startsWith('--proposals='))?.split('=')[1] || '8'),
    reviewCount: parseInt(args.find(a => a.startsWith('--reviews='))?.split('=')[1] || '5'),
    env: (args.find(a => a.startsWith('--env='))?.split('=')[1] as any) || 'staging',
  };
  
  console.log('🚀 Production Seed Script');
  console.log('========================');
  console.log(`Environment: ${config.env}`);
  console.log(`Users: ${config.userCount}`);
  console.log(`Offers: ${config.offerCount}`);
  console.log(`Requests: ${config.requestCount}`);
  console.log(`Deals: ${config.dealCount}`);
  console.log(`Proposals: ${config.proposalCount}`);
  console.log(`Reviews: ${config.reviewCount}`);
  console.log('');
  
  if (config.env === 'production') {
    console.log('⚠️  WARNING: Running in PRODUCTION mode!');
    console.log('This will create real data in the production database.');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  try {
    // Seed users
    const users = await seedUsers(config.userCount);
    
    // Seed offers
    const offers = await seedOffers(config.offerCount, users);
    
    // Seed requests
    const requests = await seedRequests(config.requestCount, users);
    
    console.log('\n✅ Seed complete!');
    console.log('==================');
    console.log(`Created:`);
    console.log(`  - ${users.length} users`);
    console.log(`  - ${offers.length} offers`);
    console.log(`  - ${requests.length} requests`);
    console.log('\nDemo credentials:');
    console.log(`  Email: demo.user1@skillvalue.ai`);
    console.log(`  Password: DemoPass123!`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
