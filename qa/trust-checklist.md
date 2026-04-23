# Trust / Verification QA Checklist

## Scope

- Trust Score, Verification Level, Completed Deals, Dispute Ratio, Review Count
- Display on: Profile, Offer Detail, Request Detail, Deal Card, User Summary
- Backend API: trustService, routes, types
- Mobile services: trustService, offerService, requestService
- Consistency check across all screens

---

## 1. Trust Score Display Tests

### 1.1 Range Validation

| Test Case | Expected | Backend | Mobile | Status |
|-----------|----------|---------|--------|--------|
| trustScore is 0-100 | Must be within range | ✅ 0-100 enforced | ✅ 0-100 enforced | PASS |
| Negative values | Rejected or clamped to 0 | ⚠️ Not validated | N/A | BUG |
| Values > 100 | Rejected or clamped to 100 | ⚠️ Not validated | N/A | BUG |

**Bug Details:**
- **ID**: TRUST-001
- **Location**: `src/services/trustService.ts` line 81
- **Issue**: `trustScore: data.trustScore || 0` accepts any number without validation
- **Fix**: Add validation: `trustScore: Math.min(100, Math.max(0, data.trustScore || 0))`

### 1.2 Display Format

| Screen | Field Path | Format Expected | Status |
|--------|-----------|-----------------|--------|
| Profile | TrustScoreCard line 73 | `{score}` (48px bold) | ✅ PASS |
| Offer Detail | [id].tsx line 114 | "Trust Score: {score}" | ✅ PASS |
| Deal Card | DealCard.tsx line 124 | "Trust Score: {score}" | ✅ PASS |
| Request Detail | [id].tsx line 132 | "⭐ {score}" | ✅ PASS |

---

## 2. Verification Level Tests

### 2.1 Valid Values

**Backend Enum** (`src/types/trust.ts`):
```typescript
type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'premium_verified';
```

**Mobile Enum** (`mobile/src/services/trustService.ts`):
```typescript
verificationLevel: 'unverified' | 'basic' | 'verified' | 'premium_verified';
```

| Value | Backend | Mobile | Display Label | Badge Color |
|-------|---------|--------|---------------|-------------|
| unverified | ✅ | ✅ | "Unverified" | `textSecondary` (gray) |
| basic | ✅ | ✅ | "Basic" | `info` (blue) |
| verified | ✅ | ✅ | "Verified" | `success` (green) |
| premium_verified | ✅ | ✅ | "Premium" | `success` (green) |

### 2.2 Badge Display

| Screen | Component | Props Passed | Status |
|--------|-----------|--------------|--------|
| Profile | TrustScoreCard line 76 | `verificationLevel` | ✅ PASS |
| Offer Detail | N/A (not displayed) | - | ⚠️ MISSING |
| Request Detail | N/A (not displayed) | - | ⚠️ MISSING |

**Bug Details:**
- **ID**: TRUST-002
- **Location**: `mobile/app/offers/[id].tsx`
- **Issue**: `verificationLevel` not displayed in offer detail
- **Impact**: Users cannot see provider verification status
- **Fix**: Add `<VerificationBadge level={offer.provider.verificationLevel} />`

---

## 3. Completed Deals Count Tests

### 3.1 Field Presence

| Source | Field | Type | Status |
|--------|-------|------|--------|
| Backend TrustProfile | `completedDeals` | number | ✅ |
| Mobile TrustProfile | `completedDeals` | number | ✅ |
| Offer.provider | `completedDeals` | number (optional) | ✅ |
| Request.requester | `completedDeals` | number (optional) | ✅ |

### 3.2 Display Verification

| Screen | Line | Format | Status |
|--------|------|--------|--------|
| Profile (TrustScoreCard) | Line 81 | `{completedDeals}` | ✅ PASS |
| Offer Detail | Line 117-119 | "{completedDeals} deals" | ✅ PASS |
| Request Detail | Line 135 | "{completedDeals} deals" | ✅ PASS |

### 3.3 Fallback Values

| Screen | Fallback Value | Source Priority | Issue |
|--------|----------------|-----------------|-------|
| Offer Detail | `null` → "N/A deals" | trust API → offer.provider | ✅ OK |
| Request Detail | `0` (coalesced) | request.requester | ⚠️ Inconsistent |

**Bug Details:**
- **ID**: TRUST-003
- **Location**: `mobile/app/requests/[id].tsx` line 135
- **Issue**: Uses `request.requester.completedDeals || 0` which may mask missing data
- **Fix**: Should fetch from trust API like offer detail does

---

## 4. Dispute Ratio Tests

### 4.1 Range Validation

| Test Case | Expected | Backend | Status |
|-----------|----------|---------|--------|
| 0-1 ratio | Decimal 0.0-1.0 | ⚠️ Not validated | BUG |
| Display % | Multiply by 100 | ✅ TrustScoreCard line 67 | PASS |

**Bug Details:**
- **ID**: TRUST-004
- **Location**: `src/services/trustService.ts` line 86
- **Issue**: `disputeRatio: data.disputeRatio || 0` accepts any number
- **Fix**: Add validation: `disputeRatio: Math.min(1, Math.max(0, data.disputeRatio || 0))`

### 4.2 Display Logic

| Screen | Line | Logic | Status |
|--------|------|-------|--------|
| Profile (TrustScoreCard) | Line 89-95 | Color: green if ≤5%, warning if >5% | ✅ PASS |

---

## 5. Review Count Tests

### 5.1 Field Presence

| Source | Field | Status |
|--------|-------|--------|
| Backend TrustProfile | `reviewCount` | ✅ |
| Mobile TrustProfile | `reviewCount` | ✅ |

### 5.2 Display

| Screen | Line | Format | Status |
|--------|------|--------|--------|
| Profile (TrustScoreCard) | Line 85 | `{reviewCount}` | ✅ PASS |

---

## 6. Cross-Screen Consistency Check

### 6.1 Data Sources Comparison

| Screen | trustScore Source | verificationLevel Source | completedDeals Source | Status |
|--------|-------------------|--------------------------|---------------------|--------|
| Profile | `/trust/me` API | `/trust/me` API | `/trust/me` API | ✅ CONSISTENT |
| Offer Detail | trust API → offer.provider fallback | trust API only | trust API → offer.provider fallback | ⚠️ PARTIAL |
| Request Detail | request.requester | N/A | request.requester | ❌ INCONSISTENT |
| Deal Card | deal.provider | N/A | N/A | ⚠️ LIMITED |

### 6.2 Inconsistency Analysis

**MAJOR INCONSISTENCY: Request Detail**

| Field | Expected (from trust API) | Actual (from request.requester) | Diff |
|-------|---------------------------|--------------------------------|------|
| trustScore | 92 (user_1) | 92 (mock data) | ✅ Same |
| completedDeals | 25 (user_1) | 25 (mock data) | ✅ Same |

**Risk**: If backend trust data differs from request data, user sees wrong trust info.

**Fix Required**: Request detail should fetch trust data separately like offer detail does.

### 6.3 Trust Aggregate Consistency Matrix

```
┌─────────────────┬─────────────────────────┬─────────────────────────┬──────────┐
│ Field           │ Backend (mockTrust)     │ Mobile Display          │ Match?   │
├─────────────────┼─────────────────────────┼─────────────────────────┼──────────┤
│ user_1          │                         │                         │          │
│   trustScore    │ 92                      │ Profile: 92             │ ✅ YES   │
│   trustScore    │ 92                      │ Offer: 92               │ ✅ YES   │
│   trustScore    │ 92                      │ Request: 92               │ ✅ YES   │
│   verification  │ 'verified'              │ Profile: 'verified'     │ ✅ YES   │
│   completed     │ 25                      │ Profile: 25             │ ✅ YES   │
│   completed     │ 25                      │ Offer: 25               │ ✅ YES   │
│   completed     │ 25                      │ Request: 25               │ ✅ YES   │
│   reviewCount   │ 48                      │ Profile: 48             │ ✅ YES   │
│   disputeRatio  │ 0.04                    │ Profile: 4%               │ ✅ YES   │
├─────────────────┼─────────────────────────┼─────────────────────────┼──────────┤
│ user_2          │                         │                         │          │
│   trustScore    │ 88                      │ Offer: 88               │ ✅ YES   │
│   verification  │ 'basic'                 │ Profile (if logged in)  │ N/A      │
├─────────────────┼─────────────────────────┼─────────────────────────┼──────────┤
│ user_3          │                         │                         │          │
│   trustScore    │ 95                      │ N/A                     │ N/A      │
│   verification  │ 'premium_verified'      │ N/A                     │ N/A      │
└─────────────────┴─────────────────────────┴─────────────────────────┴──────────┘
```

---

## 7. Backend Fallback Tests

### 7.1 API Response Shape

| Endpoint | Success Shape | Fallback Shape | Consistent? |
|----------|---------------|----------------|-------------|
| GET /trust/me | `{ data: TrustProfile }` | 404 error | N/A |
| GET /trust/:userId | `{ data: TrustProfile }` | 404 error | N/A |
| GET /trust | `{ data: { items: TrustProfile[] } }` | `{ data: { items: [] } }` | ✅ YES |

### 7.2 Fallback Behavior

| Screen | API Fail | Fallback Data | Shape Consistent? |
|--------|----------|---------------|-------------------|
| Profile | Error shown | null | ✅ (error state) |
| Offer Detail | Use offer.provider | offer.provider.trustScore ?? null | ⚠️ Partial |
| Offer Detail | Use offer.provider | offer.provider.completedDeals ?? null | ⚠️ Partial |

---

## 8. Backend Shape Validation

### 8.1 TrustProfile Interface Consistency

| Field | Backend Type | Mobile Type | Match? |
|-------|--------------|-------------|--------|
| userId | string | string | ✅ |
| trustScore | number | number | ✅ |
| verificationLevel | VerificationLevel | same enum | ✅ |
| completedDeals | number | number | ✅ |
| totalEarnings | number | number | ✅ |
| reviewCount | number | number | ✅ |
| disputeRatio | number | number | ✅ |
| proofs | TrustProof[] | same | ✅ |
| badges | TrustBadge[] | same | ✅ |
| lastCalculatedAt | string | string | ✅ |
| createdAt | string | string | ✅ |
| updatedAt | string | string | ✅ |

**Result**: All fields match between backend and mobile ✅

---

## 9. Known Issues Summary

### Bug List

| ID | Severity | Location | Description | Fix |
|----|----------|----------|-------------|-----|
| TRUST-001 | MEDIUM | trustService.ts:81 | trustScore not validated 0-100 | Add clamp validation |
| TRUST-002 | LOW | offers/[id].tsx | verificationLevel not displayed | Add VerificationBadge |
| TRUST-003 | MEDIUM | requests/[id].tsx | completedDeals from wrong source | Fetch from trust API |
| TRUST-004 | LOW | trustService.ts:86 | disputeRatio not validated 0-1 | Add clamp validation |

### Design Inconsistencies

| Issue | Location | Impact |
|-------|----------|--------|
| Trust Score format differs | Offer vs Request | "Trust Score: 92" vs "⭐ 92" |
| verificationLevel missing | Offer Detail | Users can't see verification status |
| completedDeals fallback | Offer Detail shows "N/A" | Better than wrong data |

---

## 10. Test Data Reference

### Mock Trust Profiles

```typescript
// src/mocks/trust.ts
const mockTrustProfiles = [
  {
    userId: 'user_1',
    trustScore: 92,           // Range: 0-100 ✅
    verificationLevel: 'verified',
    completedDeals: 25,
    reviewCount: 48,
    disputeRatio: 0.04,       // Range: 0-1 ✅
  },
  {
    userId: 'user_2',
    trustScore: 88,
    verificationLevel: 'basic',
    completedDeals: 15,
    reviewCount: 32,
    disputeRatio: 0.06,
  },
  {
    userId: 'user_3',
    trustScore: 95,
    verificationLevel: 'premium_verified',
    completedDeals: 42,
    reviewCount: 68,
    disputeRatio: 0.02,
  },
];
```

---

## 11. How to Verify

### Manual Test Steps

1. **Profile Screen**
   - Login as user_1
   - Navigate to Profile tab
   - Verify: Trust Score = 92, Level = "Verified", Deals = 25, Reviews = 48, Disputes = 4%

2. **Offer Detail**
   - Open offer_1 (provider: user_1)
   - Verify: Trust Score = 92, Deals = 25
   - Check: verificationLevel badge NOT shown (known issue)

3. **Request Detail**
   - Open request_1 (requester: user_1)
   - Verify: Trust Score = 92, Deals = 25
   - Check: Data comes from request.requester (not trust API)

4. **Backend API**
   ```bash
   curl /api/trust/me
   curl /api/trust/user_1
   curl /api/trust
   ```

---

## QA Sign-off

- [x] Trust Score range validated
- [x] Verification Level enum consistent
- [x] Completed Deals displayed correctly
- [x] Dispute Ratio calculated and displayed
- [x] Review Count present
- [x] Cross-screen consistency checked
- [x] Backend fallback shape verified
- [x] Edge cases documented

**Status**: COMPLETE with 4 known bugs
