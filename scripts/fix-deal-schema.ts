#!/usr/bin/env ts-node
/**
 * Fix Deal Schema Mismatch
 * Sync mobile Deal interface với backend LocalDeal
 */

import fs from 'fs';
import path from 'path';

const mobileDealPath = path.join(__dirname, '../mobile/src/services/dealService.ts');
const backendDealPath = path.join(__dirname, '../src/types/deal.ts');

console.log('🔧 Fixing Deal Schema Mismatch...\n');

// Đọc file hiện tại
const mobileContent = fs.readFileSync(mobileDealPath, 'utf-8');

// Interface đúng (sync với backend)
const correctDealInterface = `
export interface Deal {
  id: string;
  offerId?: string;
  requestId?: string;
  proposalId?: string;
  providerId: string;
  clientId: string;
  status: 'created' | 'funded' | 'submitted' | 'released' | 'disputed' | 'refunded' | 'under_review';
  title: string;
  description: string;
  amount: number;
  currency: string;
  fundedAmount: number;
  releasedAmount: number;
  serviceFee: number;
  milestones: DealMilestone[];
  timeline?: {
    startDate: string;
    endDate?: string;
    estimatedEndDate?: string;
  };
  delivery?: {
    submittedAt?: string;
    deliveredFiles?: string[];
    clientMessage?: string;
  };
  dispute?: {
    id: string;
    reason: string;
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'dismissed';
    createdAt: string;
  };
  reviews?: {
    providerReview?: {
      rating: number;
      comment?: string;
      createdAt: string;
    };
    clientReview?: {
      rating: number;
      comment?: string;
      createdAt: string;
    };
  };
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealMilestone {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  dueDate?: string;
  submittedAt?: string;
  approvedAt?: string;
  feedback?: string;
}
`;

console.log('✅ Generated correct Deal interface');
console.log('⚠️  Please manually update mobile/src/services/dealService.ts');
console.log('\nChanges needed:');
console.log('- Add timeline field (optional)');
console.log('- Add delivery field (optional)');
console.log('- Add reviews field (optional)');
console.log('- Ensure all fields match backend\n');

// Kiểm tra differences
const hasTimeline = mobileContent.includes('timeline');
const hasDelivery = mobileContent.includes('delivery');
const hasReviews = mobileContent.includes('reviews');

console.log('Current Status:');
console.log(`- timeline: ${hasTimeline ? '✅' : '❌ MISSING'}`);
console.log(`- delivery: ${hasDelivery ? '✅' : '❌ MISSING'}`);
console.log(`- reviews: ${hasReviews ? '✅' : '❌ MISSING'}`);

console.log('\n📝 Recommendation:');
console.log('1. Copy interface trên vào dealService.ts');
console.log('2. Đảm bảo tất cả fields match với backend');
console.log('3. Chạy lại type check: npx tsc --noEmit');
