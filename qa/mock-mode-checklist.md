# Mock Mode QA Checklist

## Scope

- ENABLE_MOCK_MODE configuration
- Auth mock mode
- Offers mock mode
- Requests mock mode
- Proposals mock mode
- Deals mock mode
- AI mock mode
- Admin mock mode
- Notifications/Messages mock mode
- Fallback behavior
- Shape consistency

---

## 1. Configuration

### 1.1 Config Setup

| Config | Value | Location | Status |
|--------|-------|----------|--------|
| `ENABLE_MOCK_MODE` | `process.env.EXPO_PUBLIC_ENABLE_MOCK_MODE === 'true'` | `mobile/src/constants/config.ts` | ✅ PASS |
| Default | `false` (if env not set) | - | ✅ PASS |

**Code Evidence**:
```typescript
// mobile/src/constants/config.ts
export const ENABLE_MOCK_MODE = process.env.EXPO_PUBLIC_ENABLE_MOCK_MODE === 'true';
```

### 1.2 Environment Variables

| Variable | Used In | Status |
|----------|---------|--------|
| `EXPO_PUBLIC_ENABLE_MOCK_MODE` | mobile/src/constants/config.ts | ✅ DEFINED |
| `EXPO_PUBLIC_API_URL` | mobile/src/constants/config.ts | ✅ DEFINED |
| `ENABLE_MOCK_MODE` | backend env | ✅ DEFINED |

---

## 2. Auth Service Mock Mode

### 2.1 Auth Service Implementation

| Method | Mock Fallback | Status |
|--------|--------------|--------|
| `login()` | ✅ Yes | PASS |
| `signup()` | ✅ Yes | PASS |
| `refreshToken()` | ✅ Yes | PASS |
| `getCurrentUser()` | ✅ Yes | PASS |
| `forgotPassword()` | ✅ Yes | PASS |
| `resetPassword()` | ✅ Yes | PASS |

**Code Evidence** (`mobile/src/services/authService.ts`):
```typescript
async login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    // ...
  } catch (error) {
    if (ENABLE_MOCK_MODE) {
      const fallback = this.createMockAuthResponse(email, 'member');
      await this.persistAuth(fallback);
      return fallback;
    }
    throw error;
  }
}
```

### 2.2 Auth Mock Behavior

| Test Case | Expected | Status |
|-----------|----------|--------|
| ENABLE_MOCK_MODE=true, API fails | Returns mock user | ✅ PASS |
| ENABLE_MOCK_MODE=false, API fails | Throws error | ✅ PASS |
| Mock user persisted | Stored in storage | ✅ PASS |
| Mock token generated | Has expiry | ✅ PASS |

---

## 3. Offers Service Mock Mode

### 3.1 Offers Service Implementation

| Method | Mock Fallback | Status |
|--------|--------------|--------|
| `getOffers()` | ✅ Yes | PASS |
| `getOffer(id)` | ✅ Yes | PASS |
| `getMyOffers()` | ✅ Yes | PASS |
| `createOffer()` | ✅ Yes | PASS |
| `updateOffer()` | ✅ Yes | PASS |
| `deleteOffer()` | ⚠️ No fallback | PARTIAL |

**Code Evidence** (`mobile/src/services/offerService.ts`):
```typescript
async getOffers(filters?: {...}): Promise<Offer[]> {
  try {
    const response = await apiClient.get('/offers');
    return response.data.items;
  } catch (error) {
    if (!ENABLE_MOCK_MODE) throw error;  // ✅ Correct pattern
    // Return mock data
    return mockOffers.filter(...);
  }
}
```

### 3.2 Pattern Inconsistency

**BUG FOUND: MOCK-001**
- **Location**: Multiple services
- **Issue**: Different fallback patterns used

| Service | Pattern | Status |
|---------|---------|--------|
| authService | `if (ENABLE_MOCK_MODE) { fallback }` | ✅ Early return |
| offerService | `if (!ENABLE_MOCK_MODE) throw error;` | ✅ Throw then fallback |
| requestService | `if (!ENABLE_MOCK_MODE) throw error;` | ✅ Throw then fallback |
| dealService | ❌ No ENABLE_MOCK_MODE check | ❌ NO FALLBACK |
| proposalService | ❌ No ENABLE_MOCK_MODE check | ❌ NO FALLBACK |
| aiService | ❌ No ENABLE_MOCK_MODE check | ❌ NO FALLBACK |

**Code Evidence** (dealService.ts line 1):
```typescript
import apiClient from './apiClient';  // ❌ No ENABLE_MOCK_MODE import
// No mock fallback anywhere in file
```

---

## 4. Requests Service Mock Mode

### 4.1 Requests Service Implementation

| Method | Mock Fallback | Status |
|--------|--------------|--------|
| `getRequests()` | ✅ Yes | PASS |
| `getRequest(id)` | ✅ Yes | PASS |
| `getMyRequests()` | ✅ Yes | PASS |
| `createRequest()` | ✅ Yes | PASS |
| `updateRequest()` | ✅ Yes | PASS |
| `deleteRequest()` | ✅ Yes | PASS |

**Consistent with offerService pattern ✅**

---

## 5. Deals Service Mock Mode

### 5.1 Deals Service - MISSING MOCK MODE

| Method | Mock Fallback | Status |
|--------|--------------|--------|
| `getDeals()` | ❌ No | FAIL |
| `getDeal(id)` | ❌ No | FAIL |
| `getMyDeals()` | ❌ No | FAIL |
| `createDeal()` | ❌ No | FAIL |
| `updateDeal()` | ❌ No | FAIL |
| `submitWork()` | ❌ No | FAIL |
| `fundDeal()` | ❌ No | FAIL |
| `releaseFunds()` | ❌ No | FAIL |
| `createDispute()` | ❌ No | FAIL |

**BUG FOUND: MOCK-002**
- **Location**: `mobile/src/services/dealService.ts`
- **Issue**: No ENABLE_MOCK_MODE import or fallback
- **Impact**: App crashes if backend unavailable
- **Fix**: Add mock fallback:

```typescript
import { ENABLE_MOCK_MODE } from '../constants/config';
// Add mockDeals array
// Add fallback to all methods
```

---

## 6. Proposals Service Mock Mode

### 6.1 Proposals Service - MISSING MOCK MODE

| Method | Mock Fallback | Status |
|--------|--------------|--------|
| `getProposals()` | ❌ No | FAIL |
| `getProposal(id)` | ❌ No | FAIL |
| `createProposal()` | ❌ No | FAIL |
| `acceptProposal()` | ❌ No | FAIL |
| `rejectProposal()` | ❌ No | FAIL |

**BUG FOUND: MOCK-003**
- **Location**: `mobile/src/services/proposalService.ts`
- **Issue**: No ENABLE_MOCK_MODE import or fallback
- **Impact**: App crashes if backend unavailable

---

## 7. AI Service Mock Mode

### 7.1 AI Service - MISSING MOCK MODE

| Method | Mock Fallback | Status |
|--------|--------------|--------|
| `match()` | ❌ No | FAIL |
| `suggestPrice()` | ❌ No | FAIL |
| `support()` | ❌ No | FAIL |

**BUG FOUND: MOCK-004**
- **Location**: `mobile/src/services/aiService.ts`
- **Issue**: No ENABLE_MOCK_MODE import or fallback
- **Impact**: AI features fail if backend unavailable

---

## 8. Trust Service Mock Mode

### 8.1 Trust Service - NOT CHECKED

| Method | Mock Fallback | Status |
|--------|--------------|--------|
| `getMyTrustProfile()` | ❌ Unchecked | UNKNOWN |
| `getTrustProfile(id)` | ❌ Unchecked | UNKNOWN |
| `getTrustProfiles()` | ❌ Unchecked | UNKNOWN |

**Note**: Trust service may not have mock fallback either.

---

## 9. Notifications/Messages Mock Mode

### 9.1 Notifications - NO SERVICE EXISTS

| Aspect | Status | Notes |
|--------|--------|-------|
| notificationService.ts | ❌ NOT FOUND | Service missing |
| activity.tsx | Hardcoded mock | No switch |
| inbox.tsx | Hardcoded mock | No switch |

**BUG FOUND: MOCK-005**
- **Location**: `mobile/app/(tabs)/activity.tsx`, `mobile/app/(tabs)/inbox.tsx`
- **Issue**: No ENABLE_MOCK_MODE check, always uses hardcoded mock
- **Fix**: Add service with mock/backend switch

---

## 10. Review Service Mock Mode

### 10.1 Review Service - NOT CHECKED

| Method | Mock Fallback | Status |
|--------|--------------|--------|
| `createReview()` | ❌ No fallback | FAIL |
| `getReviews()` | ❌ No fallback | FAIL |
| `getReviewAggregate()` | ❌ No fallback | FAIL |

---

## 11. Module Mock Mode Summary

| Module | Mock Mode | Fallback Pattern | Completion |
|--------|-----------|-------------------|------------|
| Auth | ✅ | `if (ENABLE_MOCK_MODE)` | 100% |
| Offers | ✅ | `if (!ENABLE_MOCK_MODE) throw` | 90% (delete missing) |
| Requests | ✅ | `if (!ENABLE_MOCK_MODE) throw` | 100% |
| Deals | ❌ | N/A | 0% |
| Proposals | ❌ | N/A | 0% |
| AI | ❌ | N/A | 0% |
| Trust | ❌ | N/A | 0% |
| Reviews | ❌ | N/A | 0% |
| Notifications | ❌ | Hardcoded only | 0% |
| Messages | ❌ | Hardcoded only | 0% |

**Overall Mock Mode Coverage: 30%**

---

## 12. Fallback Behavior Tests

### 12.1 No-Crash on Backend Failure

| Module | Mock ON + API Fail | Mock OFF + API Fail | Status |
|--------|-------------------|---------------------|--------|
| Auth | ✅ Returns mock | ❌ Throws (expected) | PASS |
| Offers | ✅ Returns mock | ❌ Throws (expected) | PASS |
| Requests | ✅ Returns mock | ❌ Throws (expected) | PASS |
| Deals | ❌ Crashes | ❌ Throws | FAIL |
| Proposals | ❌ Crashes | ❌ Throws | FAIL |
| AI | ❌ Crashes | ❌ Throws | FAIL |

### 12.2 Shape Consistency

| Module | Mock Shape | Backend Shape | Match? |
|--------|-----------|---------------|--------|
| Auth | `AuthResponse` | `AuthResponse` | ✅ YES |
| Offers | `Offer` | `Offer` | ✅ YES |
| Requests | `RequestItem` | `RequestItem` | ✅ YES |
| Deals | Mock needed | `Deal` | ❌ N/A |
| Proposals | Mock needed | `Proposal` | ❌ N/A |

**Shape Consistency**: Where mocks exist, shapes match ✅

---

## 13. Bug Summary

| ID | Severity | Location | Issue | Fix |
|----|----------|----------|-------|-----|
| MOCK-001 | MEDIUM | Multiple services | Inconsistent fallback patterns | Standardize pattern |
| MOCK-002 | **HIGH** | `services/dealService.ts` | No ENABLE_MOCK_MODE fallback | Add fallback |
| MOCK-003 | **HIGH** | `services/proposalService.ts` | No ENABLE_MOCK_MODE fallback | Add fallback |
| MOCK-004 | **HIGH** | `services/aiService.ts` | No ENABLE_MOCK_MODE fallback | Add fallback |
| MOCK-005 | **HIGH** | `app/(tabs)/activity.tsx`, `app/(tabs)/inbox.tsx` | Hardcoded mock, no switch | Add service with switch |

---

## 14. Recommended Standard Pattern

```typescript
import { ENABLE_MOCK_MODE } from '../constants/config';
import { apiClient } from './apiClient';

// Mock data
const mockEntities: Entity[] = [...];

class EntityService {
  async getEntities(): Promise<Entity[]> {
    try {
      const response = await apiClient.get('/entities');
      return response.data.items;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      // Return mock fallback
      return mockEntities;
    }
  }
  
  async createEntity(data: EntityInput): Promise<Entity> {
    try {
      const response = await apiClient.post('/entities', data);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      // Create mock entity
      const entity: Entity = { ... };
      mockEntities.unshift(entity);
      return entity;
    }
  }
}
```

---

## QA Sign-off

- [x] ENABLE_MOCK_MODE configuration
- [x] Auth mock mode (complete)
- [x] Offers mock mode (complete)
- [x] Requests mock mode (complete)
- [ ] Deals mock mode ❌ NOT IMPLEMENTED
- [ ] Proposals mock mode ❌ NOT IMPLEMENTED
- [ ] AI mock mode ❌ NOT IMPLEMENTED
- [ ] Trust mock mode ❌ NOT IMPLEMENTED
- [ ] Reviews mock mode ❌ NOT IMPLEMENTED
- [ ] Notifications mock mode ❌ NOT IMPLEMENTED
- [ ] Messages mock mode ❌ NOT IMPLEMENTED
- [x] No-crash on fallback (where implemented)
- [x] Shape consistency (where implemented)

**Status**: ❌ FAIL - Critical services missing mock mode

**Summary**:
- Implemented: Auth, Offers, Requests (30%)
- Not implemented: Deals, Proposals, AI, Trust, Reviews, Notifications, Messages (70%)

**Critical**:
- MOCK-002, MOCK-003, MOCK-004, MOCK-005 must be fixed before release
