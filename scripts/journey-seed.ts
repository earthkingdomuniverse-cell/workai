#!/usr/bin/env tsx
import axios, { AxiosInstance } from 'axios';

type SeedUser = {
  email: string;
  token: string;
  userId: string;
  role: 'provider' | 'requester';
};

type SeedOffer = {
  id: string;
  providerId: string;
  title: string;
};

type SeedRequest = {
  id: string;
  requesterId: string;
  title: string;
};

type SeedProposal = {
  id: string;
  providerId: string;
  clientId: string;
  requestId: string;
  proposedAmount: number;
  title: string;
};

type SeedDeal = {
  id: string;
  providerId: string;
  clientId: string;
  amount: number;
  milestoneId: string;
  title: string;
};

const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1',
  timeout: 10_000,
});

function log(message: string): void {
  console.log(`[journey-seed] ${message}`);
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function createMember(label: string, role: SeedUser['role']): Promise<SeedUser> {
  const email = `journey.${role}.${label}.${Date.now()}@skillvalue.dev`;
  const password = 'MassPass123!';
  const signup = await api.post('/auth/signup', {
    email,
    password,
    role: 'member',
  });

  const token = signup.data?.data?.token;
  const userId = signup.data?.data?.user?.id;

  if (!token || !userId) {
    throw new Error(`Unexpected auth response for ${email}`);
  }

  return { email, token, userId, role };
}

async function createOffer(provider: SeedUser, index: number): Promise<SeedOffer> {
  const payload = {
    title: `AI Offer ${index}: React + Node product build`,
    description: `Provider journey ${index}. End-to-end marketplace delivery for web product work with React, Node.js and AI-assisted iteration. Includes scoping, build, revisions and launch support.`,
    category: 'Software Development',
    price: 1200 + index * 150,
    currency: 'USD',
    pricingType: 'fixed',
    skills: ['React', 'Node.js', 'Product Strategy'],
    deliveryDays: 7 + index,
    revisions: 2,
  };

  const response = await api.post('/offers', payload, {
    headers: authHeader(provider.token),
  });

  const offer = response.data?.data;
  if (!offer?.id) {
    throw new Error(`Offer creation failed for ${provider.email}`);
  }

  return {
    id: offer.id,
    providerId: provider.userId,
    title: offer.title,
  };
}

async function createRequest(requester: SeedUser, index: number): Promise<SeedRequest> {
  const payload = {
    title: `AI Request ${index}: Marketplace feature delivery`,
    description: `Requester journey ${index}. Need a provider to deliver a scoped marketplace feature with API integration, product polish and clear communication.`,
    category: 'Software Development',
    budget: {
      min: 1000 + index * 100,
      max: 2500 + index * 200,
      currency: 'USD',
      negotiable: true,
    },
    skills: ['React', 'Node.js', 'API Integration'],
    location: {
      type: 'remote',
      country: 'Vietnam',
    },
    duration: {
      value: 2,
      unit: 'weeks',
    },
    experienceLevel: 'intermediate',
    urgency: index % 2 === 0 ? 'high' : 'medium',
  };

  const response = await api.post('/requests', payload, {
    headers: authHeader(requester.token),
  });

  const request = response.data?.data;
  if (!request?.id) {
    throw new Error(`Request creation failed for ${requester.email}`);
  }

  return {
    id: request.id,
    requesterId: requester.userId,
    title: request.title,
  };
}

async function createProposal(
  provider: SeedUser,
  request: SeedRequest,
  index: number,
): Promise<SeedProposal> {
  const amount = 1100 + index * 180;
  const payload = {
    requestId: request.id,
    title: `Proposal ${index}: delivery plan for ${request.title}`,
    message: `This proposal follows the documented journey flow. I can deliver the requested feature set with clear milestones, proactive updates and review-ready output.`,
    proposedAmount: amount,
    currency: 'USD',
    estimatedDeliveryDays: 7 + index,
    revisions: 2,
    milestones: [
      {
        id: `proposal_milestone_${index}`,
        title: 'Delivery milestone',
        description: 'Scoped implementation and walkthrough',
        amount,
      },
    ],
  };

  const response = await api.post('/proposals', payload, {
    headers: authHeader(provider.token),
  });

  const proposal = response.data?.data;
  if (!proposal?.id) {
    throw new Error(`Proposal creation failed for request ${request.id}`);
  }

  return {
    id: proposal.id,
    providerId: provider.userId,
    clientId: request.requesterId,
    requestId: request.id,
    proposedAmount: proposal.proposedAmount,
    title: proposal.title,
  };
}

async function acceptProposal(requester: SeedUser, proposalId: string): Promise<void> {
  await api.post(
    `/proposals/${proposalId}/accept`,
    {},
    {
      headers: authHeader(requester.token),
    },
  );
}

async function createDeal(
  provider: SeedUser,
  requester: SeedUser,
  proposal: SeedProposal,
  index: number,
): Promise<SeedDeal> {
  const milestoneId = `deal_milestone_${index}`;
  const response = await api.post(
    '/deals',
    {
      proposalId: proposal.id,
      requestId: proposal.requestId,
      clientId: requester.userId,
      title: `Deal ${index}: ${proposal.title}`,
      description:
        'Journey-based deal seeded from proposal acceptance. This simulates the launch path from accepted proposal to funded and released work.',
      amount: proposal.proposedAmount,
      currency: 'USD',
      milestones: [
        {
          id: milestoneId,
          title: 'Final delivery',
          description: 'Completed scoped delivery',
          amount: proposal.proposedAmount,
        },
      ],
    },
    {
      headers: authHeader(provider.token),
    },
  );

  const deal = response.data?.data;
  if (!deal?.id) {
    throw new Error(`Deal creation failed for proposal ${proposal.id}`);
  }

  return {
    id: deal.id,
    providerId: provider.userId,
    clientId: requester.userId,
    amount: proposal.proposedAmount,
    milestoneId,
    title: deal.title,
  };
}

async function fundDeal(requester: SeedUser, deal: SeedDeal): Promise<void> {
  await api.post(
    `/deals/${deal.id}/fund`,
    {
      amount: deal.amount,
      paymentMethodId: 'pm_journey_seed',
    },
    {
      headers: authHeader(requester.token),
    },
  );
}

async function submitDeal(provider: SeedUser, deal: SeedDeal): Promise<void> {
  await api.post(
    `/deals/${deal.id}/submit`,
    {
      milestoneId: deal.milestoneId,
      notes: 'Submitting work as part of documented journey seeding.',
    },
    {
      headers: authHeader(provider.token),
    },
  );
}

async function releaseDeal(requester: SeedUser, deal: SeedDeal): Promise<void> {
  await api.post(
    `/deals/${deal.id}/release`,
    {
      milestoneId: deal.milestoneId,
      amount: deal.amount,
      notes: 'Releasing funds as part of documented journey seeding.',
    },
    {
      headers: authHeader(requester.token),
    },
  );
}

async function createReview(
  reviewer: SeedUser,
  deal: SeedDeal,
  subjectType: 'user',
  subjectId: string,
  reviewerRole: 'client' | 'provider',
  rating: number,
  comment: string,
): Promise<void> {
  await api.post(
    '/reviews',
    {
      dealId: deal.id,
      subjectType,
      subjectId,
      reviewerRole,
      rating,
      comment,
      tags: rating >= 5 ? ['fast', 'clear-communication'] : ['helpful'],
    },
    {
      headers: authHeader(reviewer.token),
    },
  );
}

async function main(): Promise<void> {
  log('Starting scenario-based seeding from CORE_USER_JOURNEYS + FIRST_100_SUCCESSFUL_EXCHANGES');

  const providers = await Promise.all([
    createMember('provider-a', 'provider'),
    createMember('provider-b', 'provider'),
    createMember('provider-c', 'provider'),
    createMember('provider-d', 'provider'),
  ]);

  const requesters = await Promise.all([
    createMember('requester-a', 'requester'),
    createMember('requester-b', 'requester'),
    createMember('requester-c', 'requester'),
  ]);

  const offers: SeedOffer[] = [];
  let offerIndex = 1;
  for (const provider of providers) {
    offers.push(await createOffer(provider, offerIndex++));
    offers.push(await createOffer(provider, offerIndex++));
  }

  const requests: SeedRequest[] = [];
  let requestIndex = 1;
  for (const requester of requesters) {
    requests.push(await createRequest(requester, requestIndex++));
    requests.push(await createRequest(requester, requestIndex++));
  }

  const proposals: SeedProposal[] = [];
  for (let i = 0; i < 6; i++) {
    const provider = providers[i % providers.length];
    const request = requests[i % requests.length];
    proposals.push(await createProposal(provider, request, i + 1));
  }

  const deals: SeedDeal[] = [];
  for (let i = 0; i < 3; i++) {
    const proposal = proposals[i];
    const requester = requesters.find((item) => item.userId === proposal.clientId);
    const provider = providers.find((item) => item.userId === proposal.providerId);

    if (!requester || !provider) {
      throw new Error(`Could not resolve requester/provider for proposal ${proposal.id}`);
    }

    await acceptProposal(requester, proposal.id);
    const deal = await createDeal(provider, requester, proposal, i + 1);
    await fundDeal(requester, deal);
    await submitDeal(provider, deal);
    await releaseDeal(requester, deal);

    await createReview(
      requester,
      deal,
      'user',
      provider.userId,
      'client',
      5,
      'Great delivery quality and clear communication through the whole journey.',
    );

    await createReview(
      provider,
      deal,
      'user',
      requester.userId,
      'provider',
      5,
      'Requester was responsive, clear and approved work quickly.',
    );

    deals.push(deal);
  }

  const [offerList, requestList, proposalList, dealList, reviewList] = await Promise.all([
    api.get('/offers'),
    api.get('/requests'),
    api.get('/proposals'),
    api.get('/deals'),
    api.get('/reviews'),
  ]);

  const summary = {
    scenarioSource: ['CORE_USER_JOURNEYS.md', 'FIRST_100_SUCCESSFUL_EXCHANGES.md'],
    providersCreated: providers.length,
    requestersCreated: requesters.length,
    offersCreated: offers.length,
    requestsCreated: requests.length,
    proposalsCreated: proposals.length,
    dealsReleased: deals.length,
    reviewsCreated: deals.length * 2,
    totalsVisible: {
      offers: offerList.data?.data?.items?.length ?? null,
      requests: requestList.data?.data?.items?.length ?? null,
      proposals: proposalList.data?.data?.items?.length ?? null,
      deals: dealList.data?.data?.items?.length ?? null,
      reviews: reviewList.data?.data?.items?.length ?? null,
    },
    sampleEntities: {
      provider: providers[0].email,
      requester: requesters[0].email,
      offer: offers[0]?.id,
      request: requests[0]?.id,
      proposal: proposals[0]?.id,
      deal: deals[0]?.id,
    },
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  const payload = axios.isAxiosError(error)
    ? error.response?.data || { message: error.message }
    : { message: error instanceof Error ? error.message : String(error) };
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
