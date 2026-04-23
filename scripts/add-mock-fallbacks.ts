#!/usr/bin/env ts-node
/**
 * Add Mock Fallbacks to Services
 * Tự động thêm mock fallback vào các service chưa có
 */

import fs from 'fs';
import path from 'path';

const servicesDir = path.join(__dirname, '../mobile/src/services');

const servicesToFix = [
  {
    file: 'dealService.ts',
    mockDataName: 'mockDeals',
    mockData: `const mockDeals: Deal[] = [
  {
    id: 'deal_1',
    offerId: 'offer_1',
    providerId: 'user_1',
    clientId: 'user_2',
    status: 'created',
    title: 'Website Development Project',
    description: 'Build a modern website with React',
    amount: 5000,
    currency: 'USD',
    fundedAmount: 0,
    releasedAmount: 0,
    serviceFee: 250,
    milestones: [],
    views: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];`,
  },
  {
    file: 'proposalService.ts',
    mockDataName: 'mockProposals',
    mockData: `const mockProposals: Proposal[] = [
  {
    id: 'proposal_1',
    offerId: 'offer_1',
    requestId: 'request_1',
    message: 'I can help with this project',
    price: 4500,
    deliveryTime: 14,
    status: 'submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];`,
  },
  {
    file: 'aiService.ts',
    mockDataName: 'mockRecommendations',
    mockData: `const mockRecommendations: AiRecommendation[] = [
  {
    id: 'rec_1',
    type: 'offer',
    title: 'Web Development Services',
    description: 'Professional web development',
    score: 85,
    reason: 'Matches your skills',
    matchFactors: [
      { name: 'skills', weight: 0.5, score: 90, reason: 'Strong skill match' },
    ],
    entityId: 'offer_1',
    tags: ['React', 'Node.js'],
    price: 5000,
    currency: 'USD',
    deliveryTime: 14,
  },
];`,
  },
];

console.log('🔧 Adding Mock Fallbacks to Services\n');

for (const service of servicesToFix) {
  const filePath = path.join(servicesDir, service.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${service.file} not found, skipping...`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already has ENABLE_MOCK_MODE
  if (content.includes('ENABLE_MOCK_MODE')) {
    console.log(`✅ ${service.file} already has mock fallback`);
    continue;
  }
  
  // Check if has mock data
  if (!content.includes(service.mockDataName)) {
    // Add mock data after imports
    const lines = content.split('\n');
    let lastImportIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import')) {
        lastImportIndex = i;
      }
    }
    
    lines.splice(lastImportIndex + 1, 0, '', service.mockData);
    content = lines.join('\n');
    
    console.log(`➕ Added mock data to ${service.file}`);
  }
  
  // Add ENABLE_MOCK_MODE import if not exists
  if (!content.includes("import { ENABLE_MOCK_MODE }")) {
    const importLine = "import { ENABLE_MOCK_MODE } from '../constants/config';";
    content = importLine + '\n' + content;
    console.log(`➕ Added ENABLE_MOCK_MODE import to ${service.file}`);
  }
  
  // Add fallback pattern to methods (simplified)
  console.log(`⚠️  Please manually add fallback to methods in ${service.file}`);
  console.log(`   Pattern: if (!ENABLE_MOCK_MODE) throw error; return mockData;`);
}

console.log('\n✅ Analysis complete!');
console.log('\nNext steps:');
console.log('1. Review each service file');
console.log('2. Add fallback pattern to all async methods');
console.log('3. Test with ENABLE_MOCK_MODE=true');
console.log('4. Test with ENABLE_MOCK_MODE=false (backend)');
