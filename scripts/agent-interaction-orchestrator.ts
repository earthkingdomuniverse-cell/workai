#!/usr/bin/env ts-node
/**
 * Agent Interaction Orchestrator
 * Điều phối nhiều AI agents tương tác với nhau để tạo realistic data
 * 
 * Usage: ts-node scripts/agent-interaction-orchestrator.ts --cycles=5
 */

import { config } from 'dotenv';
config();

import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface Agent {
  id: string;
  email: string;
  token: string;
  role: 'provider' | 'client';
  skills: string[];
  hourlyRate: number;
}

interface DealFlow {
  offer?: any;
  request?: any;
  proposal?: any;
  deal?: any;
  messages: any[];
}

/**
 * Tạo agent từ existing users hoặc tạo mới
 */
async function getOrCreateAgents(count: number = 4): Promise<Agent[]> {
  const agents: Agent[] = [];
  
  // Tạo provider agents
  for (let i = 0; i < count / 2; i++) {
    try {
      const email = `agent.provider.${i}@simulation.ai`;
      const password = 'Password123!';
      
      // Try login first
      let token: string;
      try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        token = loginRes.data.token;
      } catch {
        // Create new user
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
          email,
          password,
          role: 'member',
        });
        token = signupRes.data.token;
      }
      
      agents.push({
        id: `provider_${i}`,
        email,
        token,
        role: 'provider',
        skills: ['React', 'Node.js', 'Python', 'AI/ML'].slice(i % 4),
        hourlyRate: 50 + (i * 25),
      });
    } catch (error) {
      console.error('Failed to create provider agent:', error.message);
    }
  }
  
  // Tạo client agents
  for (let i = 0; i < count / 2; i++) {
    try {
      const email = `agent.client.${i}@simulation.ai`;
      const password = 'Password123!';
      
      let token: string;
      try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        token = loginRes.data.token;
      } catch {
        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
          email,
          password,
          role: 'member',
        });
        token = signupRes.data.token;
      }
      
      agents.push({
        id: `client_${i}`,
        email,
        token,
        role: 'client',
        skills: ['Project Management', 'Business Analysis'],
        hourlyRate: 0,
      });
    } catch (error) {
      console.error('Failed to create client agent:', error.message);
    }
  }
  
  return agents;
}

/**
 * Agent A: Tạo offer
 */
async function agentCreateOffer(agent: Agent): Promise<any> {
  const offer = {
    title: `${agent.skills[0]} Development - Professional Services`,
    description: `Expert ${agent.skills.join('/')} development with ${agent.hourlyRate}/hour rate. 
      High-quality code, timely delivery, and excellent communication guaranteed.`,
    price: agent.hourlyRate,
    currency: 'USD',
    pricingType: 'hourly',
    skills: agent.skills,
    deliveryTime: 7,
    category: 'Development',
  };
  
  try {
    const response = await axios.post(
      `${API_URL}/offers`,
      offer,
      { headers: { Authorization: `Bearer ${agent.token}` } }
    );
    console.log(`✅ [${agent.id}] Created offer: "${offer.title}"`);
    return response.data;
  } catch (error) {
    console.error(`❌ [${agent.id}] Failed to create offer:`, error.message);
    return null;
  }
}

/**
 * Agent B: Tạo request
 */
async function agentCreateRequest(agent: Agent): Promise<any> {
  const request = {
    title: `Need ${['React', 'Node.js', 'Python'][Math.floor(Math.random() * 3)]} Developer`,
    description: `Looking for a skilled developer to build a web application. 
      Project scope includes frontend development, API integration, and testing.
      Budget is flexible for the right candidate.`,
    budget: {
      min: 1000,
      max: 5000,
      currency: 'USD',
      negotiable: true,
    },
    skills: ['React', 'Node.js'],
    urgency: ['medium', 'high'][Math.floor(Math.random() * 2)] as 'medium' | 'high',
    experienceLevel: 'intermediate' as const,
  };
  
  try {
    const response = await axios.post(
      `${API_URL}/requests`,
      request,
      { headers: { Authorization: `Bearer ${agent.token}` } }
    );
    console.log(`✅ [${agent.id}] Created request: "${request.title}"`);
    return response.data;
  } catch (error) {
    console.error(`❌ [${agent.id}] Failed to create request:`, error.message);
    return null;
  }
}

/**
 * Agent C: Tìm offer và tạo proposal
 */
async function agentCreateProposal(client: Agent, offers: any[]): Promise<any> {
  if (offers.length === 0) return null;
  
  // Chọn offer phù hợp
  const targetOffer = offers[Math.floor(Math.random() * offers.length)];
  
  const proposal = {
    offerId: targetOffer.id,
    message: `Hi! I'm interested in your offer. I have a project that needs ${targetOffer.skills?.join(', ') || 'development work'}. 
      Can you help with this? My budget is around $${2000 + Math.floor(Math.random() * 3000)}.
      Looking forward to hearing from you!`,
    price: 2000 + Math.floor(Math.random() * 3000),
    deliveryTime: 14,
  };
  
  try {
    const response = await axios.post(
      `${API_URL}/proposals`,
      proposal,
      { headers: { Authorization: `Bearer ${client.token}` } }
    );
    console.log(`✅ [${client.id}] Created proposal for offer "${targetOffer.title}"`);
    return { proposal: response.data, offer: targetOffer };
  } catch (error) {
    console.error(`❌ [${client.id}] Failed to create proposal:`, error.message);
    return null;
  }
}

/**
 * Agent D: Accept proposal và tạo deal
 */
async function agentCreateDeal(provider: Agent, proposalData: any): Promise<any> {
  try {
    const response = await axios.post(
      `${API_URL}/deals`,
      {
        offerId: proposalData.offer.id,
        proposalId: proposalData.proposal.id,
        title: `Project: ${proposalData.offer.title}`,
        description: proposalData.proposal.message,
        amount: proposalData.proposal.price,
        currency: 'USD',
      },
      { headers: { Authorization: `Bearer ${provider.token}` } }
    );
    console.log(`✅ [${provider.id}] Created deal for proposal`);
    return response.data;
  } catch (error) {
    console.error(`❌ [${provider.id}] Failed to create deal:`, error.message);
    return null;
  }
}

/**
 * Agent D: Fund deal
 */
async function agentFundDeal(client: Agent, deal: any): Promise<void> {
  try {
    await axios.post(
      `${API_URL}/deals/${deal.id}/fund`,
      {},
      { headers: { Authorization: `Bearer ${client.token}` } }
    );
    console.log(`✅ [${client.id}] Funded deal: "${deal.title}" ($${deal.amount})`);
  } catch (error) {
    console.error(`❌ [${client.id}] Failed to fund deal:`, error.message);
  }
}

/**
 * Agent E: Submit work
 */
async function agentSubmitWork(provider: Agent, deal: any): Promise<void> {
  // Delay ngẫu nhiên (giả lập thời gian làm việc)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  try {
    await axios.post(
      `${API_URL}/deals/${deal.id}/submit`,
      {
        message: `Work completed! Here are the deliverables:
          - Source code
          - Documentation
          - Test results
          
          Please review and let me know if you need any changes.`,
      },
      { headers: { Authorization: `Bearer ${provider.token}` } }
    );
    console.log(`✅ [${provider.id}] Submitted work for deal: "${deal.title}"`);
  } catch (error) {
    console.error(`❌ [${provider.id}] Failed to submit work:`, error.message);
  }
}

/**
 * Agent F: Release funds + Review
 */
async function agentReleaseAndReview(client: Agent, deal: any): Promise<void> {
  // Delay ngẫu nhiên (giả lập thời gian review)
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  try {
    // Release funds
    await axios.post(
      `${API_URL}/deals/${deal.id}/release`,
      {},
      { headers: { Authorization: `Bearer ${client.token}` } }
    );
    console.log(`✅ [${client.id}] Released funds for deal: "${deal.title}"`);
    
    // Create review
    await axios.post(
      `${API_URL}/reviews`,
      {
        dealId: deal.id,
        subjectType: 'user',
        subjectId: deal.providerId,
        rating: 4 + Math.floor(Math.random() * 2), // 4 or 5
        comment: [
          'Great work! Delivered on time and quality exceeded expectations.',
          'Professional communication and excellent results. Will hire again!',
          'Very satisfied with the work. Highly recommend!',
        ][Math.floor(Math.random() * 3)],
        tags: ['professional', 'on-time', 'high-quality'],
      },
      { headers: { Authorization: `Bearer ${client.token}` } }
    );
    console.log(`✅ [${client.id}] Created review for provider`);
  } catch (error) {
    console.error(`❌ [${client.id}] Failed to release/review:`, error.message);
  }
}

/**
 * Run full deal cycle
 */
async function runDealCycle(agents: Agent[], cycleNumber: number): Promise<void> {
  console.log(`\n=== Deal Cycle #${cycleNumber} ===\n`);
  
  const providers = agents.filter(a => a.role === 'provider');
  const clients = agents.filter(a => a.role === 'client');
  
  // Step 1: Providers create offers
  console.log('Step 1: Creating offers...');
  const offers = [];
  for (const provider of providers) {
    const offer = await agentCreateOffer(provider);
    if (offer) offers.push(offer);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Step 2: Clients create requests
  console.log('\nStep 2: Creating requests...');
  const requests = [];
  for (const client of clients) {
    const request = await agentCreateRequest(client);
    if (request) requests.push(request);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Step 3: Clients create proposals
  console.log('\nStep 3: Creating proposals...');
  const proposals = [];
  for (const client of clients) {
    const proposal = await agentCreateProposal(client, offers);
    if (proposal) proposals.push({ ...proposal, client });
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Step 4: Providers accept and create deals
  console.log('\nStep 4: Creating deals...');
  const deals = [];
  for (const proposal of proposals) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const deal = await agentCreateDeal(provider, proposal);
    if (deal) deals.push({ ...deal, provider, client: proposal.client });
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Step 5: Clients fund deals
  console.log('\nStep 5: Funding deals...');
  for (const deal of deals) {
    await agentFundDeal(deal.client, deal);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Step 6: Providers submit work
  console.log('\nStep 6: Submitting work...');
  for (const deal of deals) {
    await agentSubmitWork(deal.provider, deal);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Step 7: Clients release and review
  console.log('\nStep 7: Releasing funds & reviewing...');
  for (const deal of deals) {
    await agentReleaseAndReview(deal.client, deal);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n✅ Cycle #${cycleNumber} complete!`);
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const cycles = parseInt(args.find(a => a.startsWith('--cycles='))?.split('=')[1] || '3');
  const agentCount = parseInt(args.find(a => a.startsWith('--agents='))?.split('=')[1] || '6');

  console.log('🎭 Agent Interaction Orchestrator\n');
  console.log(`Cycles: ${cycles}`);
  console.log(`Agents: ${agentCount}\n`);
  
  // Create agents
  console.log('Creating agents...');
  const agents = await getOrCreateAgents(agentCount);
  console.log(`Created ${agents.length} agents\n`);
  
  // Run cycles
  for (let i = 1; i <= cycles; i++) {
    await runDealCycle(agents, i);
    
    // Delay between cycles
    if (i < cycles) {
      console.log('\n⏳ Waiting before next cycle...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 All cycles complete!');
  console.log(`Generated realistic transaction data through ${cycles} deal cycles`);
}

main().catch(console.error);
