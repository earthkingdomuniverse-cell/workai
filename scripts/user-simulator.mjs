#!/usr/bin/env node
// Real User Simulator - API Testing Tool

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}

// Test functions
async function log(label, fn) {
  try {
    const result = await fn();
    return result;
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 Real User Simulator - Starting...\n');

  // Test 1: Browse marketplace
  console.log('\n📺 User opens app...');
  const offers = await log('Get Offers', () => request('GET', '/offers'));
  const requests = await log('Get Requests', () => request('GET', '/requests'));
  console.log(
    `   Found ${offers?.items?.length || 0} offers, ${requests?.items?.length || 0} requests`,
  );

  // Test 2: View an offer
  console.log('\n👀 User views offer: offer_1');
  const offer = await log('View Offer', () => request('GET', '/offers/offer_1'));
  if (offer) {
    console.log(`   Title: ${offer.title}`);
    console.log(`   Price: $${offer.price}`);
    console.log(`   Provider: ${offer.providerId}`);
  }

  // Test 3: AI Match
  console.log('\n🤖 User runs AI Match...');
  const match = await log('AI Match', () =>
    request('POST', '/ai/match', {
      title: 'Build e-commerce website',
      skills: ['React', 'Node.js'],
      budget: { min: 3000, max: 7000 },
    }),
  );
  if (match) {
    console.log(`   Found ${match.recommendations?.length || 0} matches`);
    if (match.recommendations?.[0]) {
      const top = match.recommendations[0];
      console.log(`   Top: ${top.title} (${top.score}% match)`);
    }
  }

  // Test 4: AI Price
  console.log('\n💰 User gets price suggestion...');
  const price = await log('AI Price', () =>
    request('POST', '/ai/price', {
      title: 'Build dashboard',
      skills: ['React', 'TypeScript'],
      providerLevel: 'expert',
    }),
  );
  if (price) {
    console.log(`   Suggested: $${price.suggested_price}`);
    console.log(`   Range: $${price.floor_price} - $${price.ceiling_price}`);
  }

  // Test 5: AI Support
  console.log('\n🆘 User asks support: "cannot login to my account"');
  const support = await log('AI Support', () =>
    request('POST', '/ai/support', {
      message: 'cannot login to my account',
    }),
  );
  if (support) {
    console.log(`   Category: ${support.category}`);
    console.log(`   Priority: ${support.priority}`);
    console.log(`   Answer: ${support.answer?.substring(0, 60)}...`);
  }

  // Test 6: Trust Profile
  console.log('\n🛡️ User views trust profile: user_1');
  const trust = await log('Trust', () => request('GET', '/trust/user_1'));
  if (trust) {
    console.log(`   Score: ${trust.trustScore}/100`);
    console.log(`   Level: ${trust.verificationLevel}`);
    console.log(`   Deals: ${trust.completedDeals}`);
    console.log(`   Dispute Ratio: ${(trust.disputeRatio * 100).toFixed(1)}%`);
  }

  // Test 7: Reviews
  console.log('\n⭐ User views reviews for: user_1');
  const reviews = await log('Reviews', () => request('GET', '/reviews/by-user/user_1'));
  if (reviews) {
    console.log(`   Found ${reviews.items?.length || 0} reviews`);
  }

  // Test 8: Admin Overview
  console.log('\n📊 Admin views dashboard...');
  const [deals, allOffers, allRequests] = await Promise.all([
    log('Deals', () => request('GET', '/deals')),
    log('Offers', () => request('GET', '/offers')),
    log('Requests', () => request('GET', '/requests')),
  ]);
  console.log(`   Total Deals: ${deals?.total || 0}`);
  console.log(`   Total Offers: ${allOffers?.total || 0}`);
  console.log(`   Total Requests: ${allRequests?.total || 0}`);

  console.log('\n✅ All tests completed!\n');
}

runTests().catch(console.error);
