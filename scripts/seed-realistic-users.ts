#!/usr/bin/env tsx
/**
 * Seed Realistic Users - No AI Required
 * Tạo user thực tế như người thật với faker + templates chất lượng cao
 * 
 * Usage: npx tsx scripts/seed-realistic-users.ts --count=50
 */

import { faker } from '@faker-js/faker';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

// High-quality persona definitions
const PERSONAS = [
  {
    id: 'frontend_react',
    type: 'developer',
    specialty: 'React Frontend',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    rateRange: { min: 60, max: 150 },
    bioTemplates: [
      "Hi! I'm {name}, a frontend developer specializing in {specialty}. I love building beautiful, performant user interfaces with modern React patterns. Based in {location}, I've helped {number} startups launch their products. My focus is on clean code, accessibility, and user experience.",
      "Frontend enthusiast with {years}+ years in React ecosystem. I transform complex requirements into elegant, responsive web applications. My stack includes {skills}. Looking for challenging projects that push the boundaries of web development.",
    ],
    offerTemplates: [
      {
        title: "Modern React Development - Pixel Perfect UI",
        description: "I build blazing-fast React applications with attention to every detail.\n\nServices:\n• Custom React/Next.js development\n• Responsive design with Tailwind CSS\n• API integration (REST/GraphQL)\n• Performance optimization\n• Component library creation\n\nWhy me:\n• {years}+ years React experience\n• {projects}+ projects delivered\n• Clean, maintainable code\n• Daily communication\n\nLet's bring your vision to life!"
      }
    ]
  },
  {
    id: 'backend_node',
    type: 'developer',
    specialty: 'Node.js Backend',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS'],
    rateRange: { min: 70, max: 180 },
    bioTemplates: [
      "Backend engineer specializing in scalable Node.js applications. I design APIs that are fast, secure, and easy to maintain. Experienced with microservices, database optimization, and cloud deployment. Based in {location}.",
      "Building robust backend systems is my passion. From API design to database architecture, I ensure your application scales smoothly. Proficient in {skills}. Let's build something amazing together.",
    ],
    offerTemplates: [
      {
        title: "Scalable Backend Development & API Design",
        description: "Expert Node.js backend development for your application needs.\n\nWhat I deliver:\n• RESTful/GraphQL API development\n• Database design & optimization\n• Authentication & security\n• Microservices architecture\n• Cloud deployment (AWS/GCP)\n• CI/CD pipeline setup\n\nTech stack: {skills}\n\n{projects}+ APIs built, {years}+ years experience"
      }
    ]
  },
  {
    id: 'fullstack_js',
    type: 'developer',
    specialty: 'Full Stack JavaScript',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'],
    rateRange: { min: 80, max: 200 },
    bioTemplates: [
      "Full stack developer who can take your project from concept to deployment. I love working on products that make a difference. Strong in {skills}. Remote-friendly, based in {location}.",
      "I handle everything from database to user interface. Whether you need an MVP or scaling an existing product, I bring full-stack expertise. {years}+ years shipping products.",
    ],
    offerTemplates: [
      {
        title: "Full Stack Development - From Idea to Launch",
        description: "End-to-end development services for web applications.\n\nFull stack capabilities:\n• Frontend: React, Next.js, TypeScript\n• Backend: Node.js, Express, GraphQL\n• Database: PostgreSQL, MongoDB, Redis\n• DevOps: Docker, AWS, CI/CD\n• Architecture & planning\n\nPerfect for:\n• MVP development\n• Product features\n• System modernization\n• Performance optimization\n\nLet's build your product!"
      }
    ]
  },
  {
    id: 'ui_designer',
    type: 'designer',
    specialty: 'UI/UX Design',
    skills: ['UI Design', 'UX Design', 'Figma', 'Prototyping', 'Design Systems'],
    rateRange: { min: 50, max: 140 },
    bioTemplates: [
      "Creating intuitive, beautiful interfaces that users love. I combine aesthetics with usability to design products that not only look great but work flawlessly. Based in {location}.",
      "Design is not just how it looks, it's how it works. I craft user-centered designs backed by research and validated through testing. {years}+ years designing digital products.",
    ],
    offerTemplates: [
      {
        title: "UI/UX Design - Beautiful & Functional Interfaces",
        description: "User-centered design that drives engagement and conversions.\n\nDesign services:\n• UI design for web & mobile\n• UX research & user testing\n• Design system creation\n• Wireframing & prototyping\n• Design handoff & documentation\n• Design reviews & audits\n\nTools: Figma, Adobe Creative Suite\n\nPortfolio available upon request"
      }
    ]
  },
  {
    id: 'brand_designer',
    type: 'designer',
    specialty: 'Brand Identity',
    skills: ['Brand Identity', 'Logo Design', 'Typography', 'Color Theory', 'Guidelines'],
    rateRange: { min: 60, max: 180 },
    bioTemplates: [
      "Building memorable brands through strategic design. From logos to complete identity systems, I help businesses stand out. {years}+ years, {projects}+ brands created.",
      "Your brand is your story. I help tell it through compelling visual design. Specializing in startup branding and rebranding projects. Based in {location}.",
    ],
    offerTemplates: [
      {
        title: "Brand Identity Design - Stand Out From The Crowd",
        description: "Comprehensive branding that captures your essence.\n\nBrand package includes:\n• Logo design (3 concepts)\n• Color palette & typography\n• Brand guidelines\n• Business card & stationery\n• Social media assets\n• Brand application mockups\n\nProcess:\n1. Discovery & research\n2. Concept development\n3. Refinement\n4. Final delivery\n\nLet's create something iconic!"
      }
    ]
  },
  {
    id: 'content_writer',
    type: 'writer',
    specialty: 'Content Writing',
    skills: ['Content Writing', 'SEO', 'Blogging', 'Research', 'Copywriting'],
    rateRange: { min: 40, max: 100 },
    bioTemplates: [
      "Words that convert. I write content that ranks on Google and resonates with readers. SEO-focused but human-first. {years}+ years, {projects}+ articles published.",
      "Content strategist and writer helping brands find their voice. From blog posts to white papers, I deliver engaging content that drives results. Based in {location}.",
    ],
    offerTemplates: [
      {
        title: "SEO Content Writing - Rank & Convert",
        description: "High-quality content that drives organic traffic.\n\nContent services:\n• SEO blog posts & articles\n• Website copy\n• Product descriptions\n• White papers & case studies\n• Email newsletters\n• Social media content\n\nWhat you get:\n• Keyword research\n• SEO optimization\n• Original, engaging content\n• Revisions included\n• On-time delivery\n\nLet's grow your content!"
      }
    ]
  },
  {
    id: 'digital_marketer',
    type: 'marketer',
    specialty: 'Digital Marketing',
    skills: ['Digital Marketing', 'SEO', 'SEM', 'Analytics', 'Google Ads'],
    rateRange: { min: 60, max: 150 },
    bioTemplates: [
      "Data-driven marketer focused on ROI. I help businesses grow through strategic digital marketing. Certified in Google Ads & Analytics. {years}+ years experience.",
      "Marketing that actually works. No fluff, just results. Specializing in SEO, paid acquisition, and conversion optimization. Based in {location}.",
    ],
    offerTemplates: [
      {
        title: "Digital Marketing - Data-Driven Growth",
        description: "Marketing strategies that deliver measurable results.\n\nMarketing services:\n• SEO audit & optimization\n• Google Ads management\n• Facebook/Instagram ads\n• Conversion optimization\n• Analytics setup & reporting\n• Marketing strategy\n\nResults I deliver:\n• Increased organic traffic\n• Lower cost per acquisition\n• Higher conversion rates\n• Better ROI\n\nCertified: Google Ads, Analytics\n\nLet's grow your business!"
      }
    ]
  },
  {
    id: 'ai_engineer',
    type: 'ai',
    specialty: 'AI/ML Development',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'PyTorch', 'NLP', 'LLM'],
    rateRange: { min: 100, max: 300 },
    bioTemplates: [
      "AI engineer building intelligent solutions. From LLM integrations to custom ML models, I bring AI capabilities to your product. PhD in CS, {years}+ years industry experience.",
      "Turning data into intelligence. I specialize in NLP, LLMs, and production ML systems. Based in {location}, working with startups and enterprises.",
    ],
    offerTemplates: [
      {
        title: "AI/ML Development - Intelligent Solutions",
        description: "Cutting-edge AI development for your business needs.\n\nAI services:\n• LLM integration & fine-tuning\n• NLP solutions\n• Custom ML model development\n• Data pipeline engineering\n• AI strategy consulting\n• MLOps & deployment\n\nTech stack:\nPython, TensorFlow, PyTorch, OpenAI, Hugging Face\n\nPerfect for:\n• Chatbots & assistants\n• Content generation\n• Classification & prediction\n• Recommendation systems\n\nLet's build the future!"
      }
    ]
  },
  {
    id: 'video_editor',
    type: 'video',
    specialty: 'Video Editing',
    skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'Color Grading', 'Sound Design'],
    rateRange: { min: 50, max: 140 },
    bioTemplates: [
      "Storytelling through video. I craft engaging content that captures attention and drives action. {years}+ years, {projects}+ videos edited. Based in {location}.",
      "Video editor with an eye for detail. From YouTube content to commercial work, I make your footage shine. Fast turnaround, high quality.",
    ],
    offerTemplates: [
      {
        title: "Professional Video Editing - Tell Your Story",
        description: "High-quality video editing for content creators and businesses.\n\nEditing services:\n• YouTube & social media videos\n• Commercial & corporate\n• Color correction & grading\n• Sound design & mixing\n• Motion graphics\n• Multi-cam editing\n\nDeliverables:\n• Edited video\n• Project files\n• Revisions included\n• Various formats\n\nSoftware: Premiere Pro, After Effects, DaVinci\n\nLet's create something amazing!"
      }
    ]
  },
  {
    id: 'consultant_strategy',
    type: 'consultant',
    specialty: 'Business Strategy',
    skills: ['Business Strategy', 'Market Research', 'Financial Analysis', 'Growth'],
    rateRange: { min: 120, max: 350 },
    bioTemplates: [
      "Strategy consultant helping businesses scale. Former consultant at {company}, now helping startups and SMBs. Based in {location}.",
      "Data-driven strategy for growth. I help companies find their product-market fit and scale efficiently. {years}+ years across {industries} industries.",
    ],
    offerTemplates: [
      {
        title: "Business Strategy Consulting - Scale Smarter",
        description: "Strategic guidance for growing businesses.\n\nConsulting services:\n• Go-to-market strategy\n• Market research & analysis\n• Competitive positioning\n• Financial modeling\n• Growth planning\n• Pitch deck review\n\nIdeal for:\n• Startup founders\n• SMBs planning expansion\n• Product launches\n• Market entry\n\nFormer: McKinsey, BCG experience\n\nLet's build your strategy!"
      }
    ]
  },
];

// Request templates
const REQUEST_TEMPLATES = [
  {
    title: "Need {skill} Developer for Web Application",
    description: "We're building a {type} application and need an experienced {skill} developer to join our team.\n\nProject Overview:\n• {type} web application\n• {feature} functionality\n• Modern tech stack\n\nRequirements:\n• Strong {skill} experience\n• {years}+ years building web apps\n• Portfolio of similar projects\n• Available {availability}\n• Good communication skills\n\nBudget: ${min}-{max}\nTimeline: {timeline}\n\nPlease include your relevant experience and examples."
  },
  {
    title: "Looking for {specialty} Professional",
    description: "Seeking a talented {specialty} professional for an upcoming project.\n\nWhat we need:\n• {requirements}\n• Professional quality\n• On-time delivery\n• Clear communication\n\nIdeal candidate:\n• Proven track record\n• Strong portfolio\n• Client-focused approach\n• {experience} level\n\nBudget: Flexible, ${min}-{max}\nDeadline: {timeline}\n\nLooking forward to your proposal!"
  },
  {
    title: "{specialty} Expert Needed - Urgent",
    description: "We have an urgent need for a {specialty} expert to help with {task}.\n\nThe project:\n• {description}\n• Fast turnaround needed\n• High quality expected\n• {details}\n\nRequirements:\n• Available to start immediately\n• {experience}+ years experience\n• Previous similar work\n• Professional communication\n\nBudget: ${min}-{max}\nTimeline: {timeline}\n\nSerious inquiries only."
  },
];

interface GeneratedUser {
  id?: string;
  email: string;
  password: string;
  displayName: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  trustScore: number;
  token?: string;
  persona: typeof PERSONAS[0];
  experience: string;
  projects: number;
}

async function generateUser(persona: typeof PERSONAS[0]): Promise<GeneratedUser> {
  const displayName = faker.person.fullName();
  const location = faker.helpers.arrayElement([
    'San Francisco, USA', 'New York, USA', 'London, UK', 'Berlin, Germany',
    'Toronto, Canada', 'Singapore', 'Sydney, Australia', 'Amsterdam, Netherlands',
    'Stockholm, Sweden', 'Austin, USA', 'Seattle, USA', 'Barcelona, Spain',
    'Paris, France', 'Tel Aviv, Israel', 'Bangalore, India', 'Tokyo, Japan',
    'Remote',
  ]);
  
  const years = faker.number.int({ min: 2, max: 15 });
  const projects = faker.number.int({ min: 10, max: 200 });
  const trustScore = faker.number.int({ min: 45, max: 95 });
  
  // Generate bio
  const bioTemplate = faker.helpers.arrayElement(persona.bioTemplates);
  const bio = bioTemplate
    .replace('{name}', displayName)
    .replace('{specialty}', persona.specialty)
    .replace('{skills}', persona.skills.join(', '))
    .replace('{location}', location)
    .replace('{number}', projects.toString())
    .replace('{years}', years.toString())
    .replace('{projects}', projects.toString())
    .replace('{company}', faker.company.name())
    .replace('{industries}', faker.helpers.arrayElement(['tech', 'finance', 'healthcare', 'e-commerce']));

  const hourlyRate = faker.number.int(persona.rateRange);
  
  const firstName = displayName.split(' ')[0].toLowerCase();
  const lastName = displayName.split(' ').slice(-1)[0].toLowerCase();
  const email = `${firstName}.${lastName}${faker.number.int({ min: 1, max: 999 })}@demo.skillvalue.ai`;
  
  return {
    email,
    password: 'DemoPass123!',
    displayName,
    bio,
    skills: persona.skills,
    hourlyRate,
    location,
    trustScore,
    persona,
    experience: faker.helpers.arrayElement(['2-5', '5-10', '10+']),
    projects,
  };
}

async function createUser(userData: GeneratedUser): Promise<GeneratedUser | null> {
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

    return {
      ...userData,
      token: loginRes.data?.data?.token || loginRes.data?.token,
    };
  } catch (error: any) {
    if (error.response?.status === 409) {
      // User exists, try login
      try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          email: userData.email,
          password: userData.password,
        });
        return {
          ...userData,
          token: loginRes.data?.data?.token || loginRes.data?.token,
        };
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function createOffer(user: GeneratedUser): Promise<any> {
  if (!user.token) return null;

  const template = faker.helpers.arrayElement(user.persona.offerTemplates);
  const pricingType = faker.helpers.arrayElement(['fixed', 'hourly', 'negotiable']);
  const price = pricingType === 'hourly' 
    ? user.hourlyRate
    : faker.number.int({ min: 500, max: 10000 });

  const offer = {
    title: template.title,
    description: template.description
      .replace('{years}', user.experience)
      .replace('{projects}', user.projects.toString())
      .replace('{skills}', user.skills.join(', ')),
    price,
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP']),
    pricingType,
    skills: user.skills.slice(0, 4),
    deliveryTime: faker.number.int({ min: 3, max: 30 }),
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

async function createRequest(user: GeneratedUser): Promise<any> {
  if (!user.token) return null;

  const template = faker.helpers.arrayElement(REQUEST_TEMPLATES);
  const minBudget = faker.number.int({ min: 500, max: 3000 });
  const maxBudget = minBudget + faker.number.int({ min: 500, max: 7000 });
  const skill = faker.helpers.arrayElement(user.skills);

  const request = {
    title: template.title.replace('{skill}', skill).replace('{specialty}', user.persona.specialty),
    description: template.description
      .replace('{skill}', skill)
      .replace('{specialty}', user.persona.specialty)
      .replace('{type}', faker.helpers.arrayElement(['SaaS', 'e-commerce', 'mobile', 'web']))
      .replace('{feature}', faker.helpers.arrayElement(['user authentication', 'payment integration', 'dashboard', 'API']))
      .replace('{years}', faker.number.int({ min: 2, max: 5 }).toString())
      .replace('{availability}', faker.helpers.arrayElement(['part-time', 'full-time', 'as-needed']))
      .replace('{min}', minBudget.toLocaleString())
      .replace('{max}', maxBudget.toLocaleString())
      .replace('{timeline}', faker.helpers.arrayElement(['1-2 weeks', '2-4 weeks', '1 month', 'ASAP']))
      .replace('{requirements}', faker.helpers.arrayElement(['High quality work', 'Professional design', 'Clean code', 'Modern tech']))
      .replace('{experience}', faker.helpers.arrayElement(['Intermediate', 'Expert', 'Senior']))
      .replace('{task}', faker.helpers.arrayElement(['website redesign', 'app development', 'branding project', 'content creation']))
      .replace('{details}', faker.lorem.sentence()),
    budget: {
      min: minBudget,
      max: maxBudget,
      currency: 'USD',
      negotiable: faker.datatype.boolean(),
    },
    skills: user.skills.slice(0, 3),
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

async function main() {
  const args = process.argv.slice(2);
  const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '30');

  console.log('🚀 SEEDING REALISTIC USERS');
  console.log('==========================');
  console.log(`Target: ${count} users`);
  console.log(`API: ${API_URL}`);
  console.log('');

  // Check if API is available
  try {
    await axios.get(`${API_URL}/health`);
    console.log('✅ API is online\n');
  } catch {
    console.error('❌ API is not available. Please start the backend first.');
    console.log('   Run: npm start');
    process.exit(1);
  }

  const users: GeneratedUser[] = [];
  const offers: any[] = [];
  const requests: any[] = [];

  // Create users
  console.log('📌 Creating users...');
  for (let i = 0; i < count; i++) {
    const persona = PERSONAS[i % PERSONAS.length];
    const userData = await generateUser(persona);
    const user = await createUser(userData);
    
    if (user) {
      users.push(user);
      process.stdout.write(`✅ `);
    } else {
      process.stdout.write(`❌ `);
    }
    
    if ((i + 1) % 10 === 0) console.log(` (${i + 1}/${count})`);
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  console.log(`\n✅ Created ${users.length} users\n`);

  // Create offers (70% of users)
  console.log('📌 Creating offers...');
  const providers = faker.helpers.shuffle(users).slice(0, Math.floor(users.length * 0.7));
  for (const user of providers) {
    const offer = await createOffer(user);
    if (offer) {
      offers.push(offer);
      process.stdout.write(`📦 `);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log(`\n✅ Created ${offers.length} offers\n`);

  // Create requests (50% of users)
  console.log('📌 Creating requests...');
  const requesters = faker.helpers.shuffle(users).slice(0, Math.floor(users.length * 0.5));
  for (const user of requesters) {
    const request = await createRequest(user);
    if (request) {
      requests.push(request);
      process.stdout.write(`📋 `);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log(`\n✅ Created ${requests.length} requests\n`);

  // Summary
  console.log('🎉 SEED COMPLETE!');
  console.log('==================');
  console.log(`Users: ${users.length}`);
  console.log(`Offers: ${offers.length}`);
  console.log(`Requests: ${requests.length}`);
  console.log('');

  // Sample users
  console.log('Sample Users:');
  users.slice(0, 5).forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.displayName} - ${u.persona.specialty}`);
    console.log(`     Email: ${u.email}`);
    console.log(`     Rate: $${u.hourlyRate}/hr | Trust: ${u.trustScore}`);
    console.log(`     Skills: ${u.skills.slice(0, 3).join(', ')}`);
    console.log('');
  });

  console.log('Demo Login:');
  console.log(`  Email: ${users[0]?.email}`);
  console.log(`  Password: DemoPass123!`);
}

main().catch(console.error);
