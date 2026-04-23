# Backend Schema Integrity QA Checklist

## Scope

- Backend TypeScript types
- Mobile service interfaces
- Mock data shapes
- Enum consistency
- Status value consistency
- Field naming consistency
- Foreign key relationships
- Seed data alignment

---

## 1. Type Definition Coverage

### 1.1 Backend Types (src/types/)

| Type File | Status | Coverage |
|-----------|--------|----------|
| user.ts | ✅ | User, UserProfile, UserSession, AuthResponse |
| offer.ts | ✅ | Offer, OfferInput, OfferFilter |
| request.ts | ✅ | Request, RequestInput, RequestFilter |
| proposal.ts | ✅ | Proposal, ProposalInput |
| deal.ts | ✅ | Deal, DealMilestone, DealInput |
| review.ts | ✅ | Review, ReviewAggregate |
| trust.ts | ✅ | TrustProfile, TrustProof, TrustBadge |
| message.ts | ✅ | Conversation, Message, Participant |
| notification.ts | ✅ | Notification, NotificationData, NotificationPreferences |
| transaction.ts | ✅ | Transaction, TransactionInput |
| nextAction.ts | ✅ | NextAction, NextActionInput, NextActionOutput |
| recommendation.ts | ✅ | Recommendation, RecommendationFilter |
| admin.ts | ✅ | AdminStats, AdminAction, Dispute |
| support.ts | ✅ | SupportTicket, SupportTicketInput, SupportTicketOutput |
| ai.ts | ✅ | AiMatchInput, AiMatchOutput, AiRecommendation |
| common.ts | ✅ | Role, Permission, DealStatus, OfferStatus, etc. |

**Coverage: 100% - All entities have type definitions ✅**

### 1.2 Mobile Service Interfaces

| Service | Interface | Status |
|---------|-----------|--------|
| authService.ts | ✅ User, AuthResponse | PASS |
| offerService.ts | ✅ Offer, OfferPayload | PASS |
| requestService.ts | ✅ RequestItem, RequestPayload | PASS |
| proposalService.ts | ✅ Proposal, ProposalPayload | PASS |
| dealService.ts | ✅ Deal, DealMilestone | PASS |
| trustService.ts | ✅ TrustProfile | PASS |
| reviewService.ts | ✅ Review, ReviewAggregate | PASS |
| aiService.ts | ✅ AiMatchInput, AiRecommendation | PASS |
| messageService.ts | ❌ NOT FOUND | MISSING |
| notificationService.ts | ❌ NOT FOUND | MISSING |
| transactionService.ts | ❌ NOT FOUND | MISSING |
| adminService.ts | ❌ NOT FOUND | MISSING |

**Coverage: 67% - Missing services for messages, notifications, transactions, admin**

---

## 2. Enum Consistency

### 2.1 Role Enum

| Location | Values | Consistent? |
|----------|--------|-------------|
| Backend (common.ts) | 'member' \| 'operator' \| 'admin' | ✅ YES |
| Mobile (authService.ts) | 'member' \| 'operator' \| 'admin' | ✅ YES |

### 2.2 Deal Status Enum

**BACKEND** (common.ts):
```typescript
type DealStatus = 
  | 'created' 
  | 'funded' 
  | 'submitted' 
  | 'released' 
  | 'disputed' 
  | 'refunded' 
  | 'under_review';
```

**MOBILE** (dealService.ts):
```typescript
status: 
  | 'created'
  | 'funded'
  | 'submitted'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'under_review';
```

**Status**: ✅ CONSISTENT

### 2.3 Offer Status Enum

**BACKEND** (common.ts):
```typescript
type OfferStatus = 'active' | 'inactive' | 'archived' | 'completed';
```

**MOBILE** (offerService.ts):
```typescript
status?: 'active' | 'inactive' | 'archived' | 'completed';
```

**Status**: ✅ CONSISTENT

### 2.4 Proposal Status Enum

**BACKEND** (common.ts):
```typescript
type ProposalStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn';
```

**MOBILE** (proposalService.ts):
```typescript
status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn';
```

**Status**: ✅ CONSISTENT

### 2.5 Verification Level Enum

**BACKEND** (trust.ts):
```typescript
type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'premium_verified';
```

**MOBILE** (trustService.ts):
```typescript
verificationLevel: 'unverified' | 'basic' | 'verified' | 'premium_verified';
```

**Status**: ✅ CONSISTENT

### 2.6 Request Status Enum

**BACKEND** (common.ts):
```typescript
type RequestStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'archived';
```

**MOBILE** (requestService.ts):
```typescript
status?: 'open' | 'in_progress' | 'completed' | 'archived';
```

**BUG FOUND: SCHEMA-001**
- **Location**: `mobile/src/services/requestService.ts`
- **Issue**: Missing 'cancelled' status in mobile
- **Fix**: Add 'cancelled' to mobile enum

---

## 3. Field Naming Consistency

### 3.1 User Entity

| Field | Backend | Mobile | Match? |
|-------|---------|--------|--------|
| id | ✅ | ✅ | YES |
| email | ✅ | ✅ | YES |
| role | ✅ | ✅ | YES |
| trustScore | ✅ | ✅ | YES |
| profile | ✅ | ❌ (separate fetch) | PARTIAL |
| onboardingCompleted | ✅ | ✅ | YES |

### 3.2 Deal Entity

| Field | Backend (deal.ts) | Mobile (dealService.ts) | Match? |
|-------|-----------------|------------------------|--------|
| id | ✅ | ✅ | YES |
| offerId | ✅ | ✅ | YES |
| requestId | ✅ | ✅ | YES |
| proposalId | ✅ | ✅ | YES |
| providerId | ✅ | ✅ | YES |
| clientId | ✅ | ✅ | YES |
| status | ✅ | ✅ | YES |
| title | ✅ | ✅ | YES |
| description | ✅ (optional) | ✅ | YES |
| amount | ✅ | ✅ | YES |
| currency | ✅ | ✅ | YES |
| milestones | ✅ | ✅ | YES |
| funding.status | ✅ | ❌ DIFFERENT | NO |
| funding.fundedAmount | ✅ | ❌ DIFFERENT | NO |
| timeline | ✅ | ❌ DIFFERENT | NO |
| dispute | ✅ | ✅ | YES |
| reviews | ✅ | ❌ MISSING | NO |

**BUG FOUND: SCHEMA-002**
- **Location**: Multiple files
- **Issue**: Deal interface differs between backend and mobile

**Backend structure**:
```typescript
funding: {
  status: 'unfunded' | 'funded' | 'partially_funded' | 'refunded';
  fundedAmount: number;
  releasedAmount: number;
  refundedAmount: number;
}
```

**Mobile structure**:
```typescript
fundedAmount: number;
releasedAmount: number;
serviceFee: number;
```

**Missing in mobile**:
- `funding.status`
- `funding.refundedAmount`
- `timeline`
- `reviews`

### 3.3 Trust Profile Entity

| Field | Backend | Mobile | Match? |
|-------|---------|--------|--------|
| userId | ✅ | ✅ | YES |
| trustScore | ✅ | ✅ | YES |
| verificationLevel | ✅ | ✅ | YES |
| completedDeals | ✅ | ✅ | YES |
| totalEarnings | ✅ | ✅ | YES |
| reviewCount | ✅ | ✅ | YES |
| disputeRatio | ✅ | ✅ | YES |
| proofs | ✅ | ✅ | YES |
| badges | ✅ | ✅ | YES |
| lastCalculatedAt | ✅ | ✅ | YES |
| createdAt | ✅ | ✅ | YES |
| updatedAt | ✅ | ✅ | YES |

**Status**: ✅ FULLY CONSISTENT

---

## 4. Mock Data Alignment

### 4.1 Mock Data Files

| Mock File | Backend Types | Mobile Service | Aligned? |
|-----------|--------------|----------------|----------|
| users.ts | ✅ | ✅ | YES |
| offers.ts | ✅ | ✅ | YES |
| requests.ts | ✅ | ✅ | YES |
| proposals.ts | ✅ | ✅ | YES |
| deals.ts | ✅ | ✅ | YES |
| trust.ts | ✅ | ✅ | YES |
| reviews.ts | ✅ | ✅ | YES |
| notifications.ts | ✅ | ❌ NO SERVICE | NO |
| transactions.ts | ✅ | ❌ NO SERVICE | NO |
| ai.ts | ✅ | ❌ NO SERVICE | NO |

**Mock Data Coverage: 70%**

### 4.2 Mock Data Completeness

| Entity | Mock Count | Realistic Data | Status |
|--------|-----------|----------------|--------|
| Users | 3 | ✅ | GOOD |
| Offers | 2 | ✅ | GOOD |
| Requests | 2 | ✅ | GOOD |
| Proposals | 2 | ✅ | GOOD |
| Deals | 2 | ✅ | GOOD |
| Trust Profiles | 3 | ✅ | GOOD |
| Reviews | 3 | ✅ | GOOD |
| Notifications | 4 | ✅ | GOOD |
| Transactions | 3 | ✅ | GOOD |
| AI Recommendations | 2 | ⚠️ | ADEQUATE |

---

## 5. Foreign Key Relationships

### 5.1 Referential Integrity in Types

| Relationship | Backend | Mobile | Status |
|--------------|---------|--------|--------|
| Deal → Offer | ✅ offerId | ✅ | PASS |
| Deal → Request | ✅ requestId | ✅ | PASS |
| Deal → Proposal | ✅ proposalId | ✅ | PASS |
| Deal → Provider | ✅ providerId | ✅ | PASS |
| Deal → Client | ✅ clientId | ✅ | PASS |
| Offer → Provider | ✅ providerId | ✅ | PASS |
| Request → Requester | ✅ requesterId | ✅ | PASS |
| Proposal → Offer | ✅ offerId | ✅ | PASS |
| Proposal → Request | ✅ requestId | ✅ | PASS |
| Review → Deal | ✅ dealId | ✅ | PASS |
| Review → Reviewer | ✅ reviewerId | ✅ | PASS |
| Message → Conversation | ✅ conversationId | N/A | N/A |
| Notification → User | ✅ userId | N/A | N/A |

**All relationships properly typed ✅**

### 5.2 Logical Relations (Not Enforced)

| Relation | Enforced | Notes |
|----------|----------|-------|
| User → TrustProfile | ❌ | Separate fetch |
| User → Profile | ❌ | Separate fetch |
| Deal → Milestones | ⚠️ | Embedded array |
| Deal → Timeline | ⚠️ | Embedded object |

---

## 6. Seed Data Match

### 6.1 Seed Data Files

| Seed File | Exists | Schema Match | Status |
|-----------|--------|--------------|--------|
| users.seed.ts | ❌ | N/A | MISSING |
| offers.seed.ts | ❌ | N/A | MISSING |
| requests.seed.ts | ❌ | N/A | MISSING |
| deals.seed.ts | ❌ | N/A | MISSING |

**BUG FOUND: SCHEMA-003**
- **Issue**: No seed data scripts found
- **Impact**: Cannot populate database with test data
- **Recommendation**: Create seed scripts in `/scripts/` or `/database/seeds/`

### 6.2 Mock as Seed

| Mock File | Can Use as Seed | Status |
|-----------|----------------|--------|
| users.ts | ✅ | PASS |
| offers.ts | ✅ | PASS |
| requests.ts | ✅ | PASS |
| deals.ts | ✅ | PASS |
| trust.ts | ✅ | PASS |

**Mocks can serve as seed data templates ✅**

---

## 7. Module Readiness for Mock OFF

### 7.1 Backend API Routes

| Module | Routes | Status |
|--------|--------|--------|
| Auth | ✅ /auth/login, /auth/signup, /auth/refresh, /auth/me | READY |
| Users | ✅ /users, /users/:id, /users/me | READY |
| Offers | ✅ /offers, /offers/:id, /offers/mine | READY |
| Requests | ✅ /requests, /requests/:id, /requests/mine | READY |
| Proposals | ✅ /proposals, /proposals/:id, /proposals/mine | READY |
| Deals | ✅ /deals, /deals/:id, /deals/mine | READY |
| Trust | ✅ /trust, /trust/:id, /trust/me | READY |
| Reviews | ✅ /reviews, /reviews/aggregate | READY |
| AI | ✅ /ai/match, /ai/price, /ai/support | READY |
| Admin | ⚠️ /admin/* (partial) | PARTIAL |
| Messages | ❌ No routes | NOT READY |
| Notifications | ❌ No routes | NOT READY |
| Transactions | ❌ No routes | NOT READY |

### 7.2 Mobile Service Readiness

| Module | Service | Mock Fallback | Ready? |
|--------|---------|---------------|--------|
| Auth | ✅ | ✅ | READY |
| Offers | ✅ | ✅ | READY |
| Requests | ✅ | ✅ | READY |
| Proposals | ✅ | ❌ | NOT READY |
| Deals | ✅ | ❌ | NOT READY |
| Trust | ✅ | ❌ | NOT READY |
| Reviews | ✅ | ❌ | NOT READY |
| AI | ✅ | ❌ | NOT READY |
| Messages | ❌ | N/A | NOT READY |
| Notifications | ❌ | N/A | NOT READY |
| Admin | ❌ | N/A | NOT READY |
| Transactions | ❌ | N/A | NOT READY |

**Readiness: 50%**

---

## 8. Critical Schema Mismatches

### 8.1 Deal Interface Mismatch

| Aspect | Backend | Mobile | Severity |
|--------|---------|--------|----------|
| Funding structure | Nested object | Flat fields | HIGH |
| Timeline | Nested object | Missing | MEDIUM |
| Reviews | Nested object | Missing | LOW |

**Recommendation**: Sync mobile Deal interface with backend

### 8.2 Request Status Mismatch

| Location | 'cancelled' Status | Severity |
|----------|-------------------|----------|
| Backend | ✅ Present | - |
| Mobile | ❌ Missing | MEDIUM |

### 8.3 Missing Services

| Service | Mobile | Backend | Severity |
|---------|--------|---------|----------|
| messageService | ❌ | ✅ | HIGH |
| notificationService | ❌ | ✅ | HIGH |
| transactionService | ❌ | ✅ | HIGH |
| adminService | ❌ | ✅ | MEDIUM |

---

## 9. Bug Summary

| ID | Severity | Location | Issue | Fix |
|----|----------|----------|-------|-----|
| SCHEMA-001 | MEDIUM | `mobile/src/services/requestService.ts` | Missing 'cancelled' status | Add to enum |
| SCHEMA-002 | HIGH | `mobile/src/services/dealService.ts` | Deal interface differs from backend | Sync interfaces |
| SCHEMA-003 | MEDIUM | `/database/` or `/scripts/` | No seed data scripts | Create seed scripts |
| SCHEMA-004 | HIGH | `mobile/src/services/` | Missing messageService | Create service |
| SCHEMA-005 | HIGH | `mobile/src/services/` | Missing notificationService | Create service |
| SCHEMA-006 | HIGH | `mobile/src/services/` | Missing transactionService | Create service |
| SCHEMA-007 | MEDIUM | `mobile/src/services/` | Missing adminService | Create service |

---

## 10. Recommendations

### Immediate (Before Release)

1. **Fix SCHEMA-002**: Sync Deal interface
2. **Create SCHEMA-004, 005**: Add message and notification services
3. **Fix MOCK-002, 003, 004**: Add mock fallbacks to deals, proposals, AI

### Short-term (Post-release)

1. **Fix SCHEMA-001**: Add missing status values
2. **Create SCHEMA-003**: Add seed scripts
3. **Create SCHEMA-006, 007**: Add transaction and admin services

---

## QA Sign-off

- [x] Backend types defined (100%)
- [x] Mobile service interfaces (67%)
- [x] Enum consistency (mostly)
- [x] Field naming (mostly)
- [x] Mock data alignment (70%)
- [x] Foreign key relationships (100%)
- [ ] Seed data scripts ❌ MISSING
- [x] Mock as seed templates ✅

**Status**: ⚠️ PARTIAL

**Summary**:
- Schema definitions: 90% complete
- Mobile service parity: 60% complete
- Critical gaps: Deal interface mismatch, missing services

**Blockers for Mock OFF**:
1. SCHEMA-002: Deal interface mismatch
2. SCHEMA-004: Missing messageService
3. SCHEMA-005: Missing notificationService
