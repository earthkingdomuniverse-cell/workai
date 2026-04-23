# AI Next Best Action QA Checklist

## Scope

- AI Next Action recommendation feature
- Display on: Home, Profile, Deal Detail, /ai/next-action screen
- CTA navigation handling
- Fallback mode
- Duplicate prevention

---

## 1. Next Action Display Tests

### 1.1 Home Screen Display

| Test Case            | Expected                                   | Status  |
| -------------------- | ------------------------------------------ | ------- |
| Next actions visible | Shows relevant actions based on user state | ❌ FAIL |
| Action cards         | NextActionCard components rendered         | ❌ FAIL |
| Empty state          | Shows when no actions                      | N/A     |

**BUG FOUND: NEXT-ACTION-001**

- **Location**: `mobile/app/(tabs)/home.tsx`
- **Issue**: Home screen does NOT display next actions at all
- **Current**: Only shows offer/request recommendations
- **Expected**: Should display personalized next actions
- **Fix**: Import and display NextActionCard or add next actions section

**Code Evidence**:

```typescript
// home.tsx only shows:
- RecommendationCard for offers/requests
- NO NextActionCard
- NO next actions logic
```

### 1.2 Profile Screen Display

| Test Case             | Expected                                                 | Status  |
| --------------------- | -------------------------------------------------------- | ------- |
| Profile-based actions | Shows actions like "Complete Profile", "Verify Identity" | ❌ FAIL |
| Trust-based actions   | Shows based on verificationLevel                         | ❌ FAIL |
| Deal-based actions    | Shows based on pending deals                             | ❌ FAIL |

**BUG FOUND: NEXT-ACTION-002**

- **Location**: `mobile/app/(tabs)/profile.tsx`
- **Issue**: Profile screen does NOT display next actions
- **Current**: Only shows TrustScoreCard and Rating Overview
- **Expected**: Should show profile-related next actions
- **Fix**: Add NextAction section based on trust profile state

**Code Evidence**:

```typescript
// profile.tsx only shows:
- TrustScoreCard
- Rating Overview section
- NO NextActionCard
```

### 1.3 Deal Detail Display

| Test Case           | Expected                                          | Status  |
| ------------------- | ------------------------------------------------- | ------- |
| Deal status actions | Shows "Fund Deal", "Submit Work", "Release Funds" | ❌ FAIL |
| Context-aware       | Actions match deal state                          | ❌ FAIL |

**BUG FOUND: NEXT-ACTION-003**

- **Location**: `mobile/app/deals/[id].tsx` (not found)
- **Issue**: Deal detail screen not found in codebase
- **Expected**: Should show deal-specific next actions
- **Fix**: Create deals/[id].tsx with NextActionCard integration

### 1.4 /ai/next-action Screen Display

| Test Case           | Expected                                | Status  |
| ------------------- | --------------------------------------- | ------- |
| All actions visible | Shows personalized actions list         | ✅ PASS |
| Card rendering      | NextActionCard displays correctly       | ✅ PASS |
| Loading state       | Shows "Loading next actions..."         | ✅ PASS |
| Empty state         | Shows "No actions right now" when empty | ✅ PASS |
| Error state         | Shows error with retry                  | ✅ PASS |
| Pull-to-refresh     | RefreshControl works                    | ✅ PASS |

**Code Evidence**:

```typescript
// next-action.tsx lines 126-151:
<ScrollView refreshControl={<RefreshControl ... />}>
  <Text style={styles.title}>AI Next Action</Text>
  {items.length === 0 ? (
    <EmptyState title="No actions right now" ... />
  ) : (
    items.map((item) => <NextActionCard key={item.id} ... />)
  )}
</ScrollView>
```

---

## 2. Next Action Logic Analysis

### 2.1 Mobile Logic (`mobile/app/ai/next-action.tsx`)

```typescript
// Lines 29-108 - Client-side logic:
1. Fetch trust profile → check verificationLevel
2. Fetch deals → check for in_progress deals
3. Fetch offers → check if empty
4. Fetch requests → check if exist
5. Build actions array locally
```

| Condition                                     | Action Generated          | Status |
| --------------------------------------------- | ------------------------- | ------ |
| `trust.verificationLevel === 'unverified'`    | "Verify Your Identity"    | ✅     |
| `deals.some(d => d.status === 'in_progress')` | "Complete Your Deal"      | ✅     |
| `offers.length === 0`                         | "Create Your First Offer" | ✅     |
| `requests.length > 0`                         | "Send a Proposal"         | ✅     |

**Issue**: Mobile implements its OWN logic, doesn't use backend `aiAssistantService`

### 2.2 Backend Logic (`src/services/aiAssistantService.ts`)

```typescript
// Backend logic:
1. complete_profile (if bio/skills missing)
2. create_first_offer (if no offers)
3. respond_to_proposal (if pending proposals)
4. submit_work (if funded deals)
5. release_funds (if submitted deals)
6. review_completed_work (if released deals)
7. verify_identity (if unverified/basic)
8. explore_offers/explore_requests (fallback)
```

**Contract Issue**: Mobile doesn't use backend API, implements parallel logic

---

## 3. CTA Navigation Tests

### 3.1 Route Mapping

| Action Type        | Expected Route          | Actual Route       | Match?      |
| ------------------ | ----------------------- | ------------------ | ----------- |
| verify_identity    | `/profile/verification` | `/(tabs)/profile`  | ❌ MISMATCH |
| complete_deal      | `/deals`                | `/(tabs)/deals`    | ⚠️ PARTIAL  |
| create_first_offer | `/offers/create`        | `/offers/create`   | ✅ MATCH    |
| send_proposal      | `/requests`             | `/(tabs)/requests` | ⚠️ PARTIAL  |

**BUG FOUND: NEXT-ACTION-004**

- **Location**: `mobile/app/ai/next-action.tsx` lines 40-99
- **Issue**: Routes in mobile don't match backend template routes
- **Impact**: CTA navigation may fail or go to wrong screen

### 3.2 CTA Press Handling

| Test Case    | Expected                 | Status  |
| ------------ | ------------------------ | ------- |
| Card press   | Navigate to action.route | ❌ FAIL |
| CTA text     | Shows correct text       | ✅ PASS |
| Button style | Styled as text link      | ✅ PASS |

**BUG FOUND: NEXT-ACTION-005**

- **Location**: `mobile/app/ai/next-action.tsx` line 148
- **Issue**: `onPress={() => {}}` - empty handler!
- **Current**: Cards don't navigate anywhere when pressed
- **Fix**: Implement navigation handler:

```typescript
onPress={(action) => router.push(action.route)}
```

**Code Evidence**:

```typescript
// Line 148:
<NextActionCard key={item.id} action={item} onPress={() => {}} />
//                                                    ^^^^^^^^^ EMPTY!
```

---

## 4. Fallback Mode Tests

### 4.1 Mobile Fallback

| Condition           | Fallback Action                              | Status  |
| ------------------- | -------------------------------------------- | ------- |
| Trust API fails     | Uses default actions (offers/requests)       | ✅ PASS |
| All APIs fail       | Shows error                                  | ✅ PASS |
| No specific actions | Shows "Create First Offer" + "Send Proposal" | ✅ PASS |

**Code Evidence** (lines 67-69):

```typescript
} catch (e) {
  // Trust not available, use defaults
}
```

### 4.2 Backend Fallback

| Condition              | Fallback Action                       | Status  |
| ---------------------- | ------------------------------------- | ------- |
| `actions.length === 0` | "Explore Offers" + "Explore Requests" | ✅ PASS |

**Code Evidence** (aiAssistantService.ts lines 134-144):

```typescript
if (actions.length === 0) {
  actions.push({ ...NEXT_ACTION_TEMPLATES.explore_offers });
  actions.push({ ...NEXT_ACTION_TEMPLATES.explore_requests });
}
```

---

## 5. Duplicate Prevention Tests

### 5.1 ID Generation

| Aspect     | Implementation                       | Status   |
| ---------- | ------------------------------------ | -------- |
| Mobile ID  | `id: '1'`, `id: '2'`, etc. (static)  | ❌ RISKY |
| Backend ID | `action_${Date.now()}_N` (timestamp) | ✅ GOOD  |

**Issue**: Mobile uses static IDs (`'1'`, `'2'`, `'3'`, `'4'`) which could cause React key collisions

### 5.2 Duplicate Logic Check

| Scenario                    | Expected                   | Status  |
| --------------------------- | -------------------------- | ------- |
| Same action triggered twice | Same ID, React warning     | ⚠️ RISK |
| Multiple conditions met     | Multiple different actions | ✅ OK   |

**Code Evidence** (mobile lines 40-99):

```typescript
// Static IDs used:
id: '1', // verify_identity
id: '2', // complete_deal
id: '3', // create_first_offer
id: '4', // send_proposal
```

---

## 6. Contract Mismatch: Mobile vs Backend

### 6.1 NextAction Interface

| Field         | Mobile Interface | Backend Interface                   | Match?   |
| ------------- | ---------------- | ----------------------------------- | -------- |
| `id`          | `string`         | `string`                            | ✅ YES   |
| `type`        | `string`         | `NextActionType`                    | ⚠️ LOOSE |
| `title`       | `string`         | `string`                            | ✅ YES   |
| `description` | `string`         | `string`                            | ✅ YES   |
| `priority`    | `string`         | `'low'\|'medium'\|'high'\|'urgent'` | ⚠️ LOOSE |
| `cta`         | `string`         | `string`                            | ✅ YES   |
| `route`       | `string`         | `string`                            | ✅ YES   |
| `icon`        | `string`         | `string`                            | ✅ YES   |
| `context`     | **MISSING**      | `any?`                              | ❌ NO    |
| `deadline`    | **MISSING**      | `string?`                           | ❌ NO    |

**BUG FOUND: NEXT-ACTION-006**

- **Location**: `mobile/app/ai/next-action.tsx` lines 12-21
- **Issue**: `context` and `deadline` fields missing from mobile interface
- **Impact**: Backend actions with context/deadline won't display correctly

### 6.2 NextActionInput

| Field     | Backend  | Mobile             | Status     |
| --------- | -------- | ------------------ | ---------- |
| `userId`  | Required | **NOT USED**       | ❌ NO      |
| `profile` | Optional | **NOT USED**       | ❌ NO      |
| `deals`   | Optional | Fetched separately | ⚠️ PARTIAL |
| `offers`  | Optional | Fetched separately | ⚠️ PARTIAL |

**Issue**: Mobile doesn't use unified NextActionInput, fetches data separately

---

## 7. Logic Weakness Analysis

### 7.1 Missing Action Types in Mobile

| Backend Action        | Mobile Implemented | Status                           |
| --------------------- | ------------------ | -------------------------------- |
| complete_profile      | ❌ NO              | Missing for incomplete profiles  |
| fund_deal             | ❌ NO              | Missing for unfunded deals       |
| submit_work           | ❌ NO              | Missing for funded deals         |
| release_funds         | ❌ NO              | Missing for submitted deals      |
| review_completed_work | ❌ NO              | Missing for released deals       |
| respond_to_proposal   | ❌ NO              | Missing for pending proposals    |
| update_skills         | ❌ NO              | Missing for skill gaps           |
| check_notifications   | ❌ NO              | Missing for unread notifications |
| view_analytics        | ❌ NO              | Missing for performance tracking |

**Summary**: Mobile only implements 4/15 action types!

### 7.2 Priority Logic Issues

| Issue                | Expected                     | Actual                  |
| -------------------- | ---------------------------- | ----------------------- |
| Priority sorting     | Urgent > High > Medium > Low | ❌ NOT SORTED in mobile |
| Duplicate priorities | All mixed together           | No secondary sort       |
| Limit                | Max 5 actions shown          | No limit in mobile      |

**Backend handles this correctly** (aiAssistantService.ts lines 146-152):

```typescript
actions.sort((a, b) => {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  return priorityOrder[b.priority] - priorityOrder[a.priority];
});
return actions.slice(0, 5);
```

---

## 8. Bug Summary

| ID              | Severity | Location                              | Issue                                             | Fix                             |
| --------------- | -------- | ------------------------------------- | ------------------------------------------------- | ------------------------------- |
| NEXT-ACTION-001 | **HIGH** | `mobile/app/(tabs)/home.tsx`          | Home screen doesn't show next actions             | Add NextAction section          |
| NEXT-ACTION-002 | **HIGH** | `mobile/app/(tabs)/profile.tsx`       | Profile screen doesn't show next actions          | Add NextAction section          |
| NEXT-ACTION-003 | **HIGH** | Deal detail missing                   | Deal detail doesn't exist/show next actions       | Create deals/[id].tsx           |
| NEXT-ACTION-004 | MEDIUM   | `mobile/app/ai/next-action.tsx`       | Routes don't match backend templates              | Update route constants          |
| NEXT-ACTION-005 | **HIGH** | `mobile/app/ai/next-action.tsx:148`   | CTA onPress is empty                              | Implement navigation handler    |
| NEXT-ACTION-006 | MEDIUM   | `mobile/app/ai/next-action.tsx:12-21` | Missing context/deadline fields                   | Add to interface                |
| NEXT-ACTION-007 | LOW      | `mobile/app/ai/next-action.tsx`       | Static IDs risk React key collisions              | Use timestamp-based IDs         |
| NEXT-ACTION-008 | MEDIUM   | Mobile implementation                 | Only 4/15 action types implemented                | Add missing action logic        |
| NEXT-ACTION-009 | LOW      | Mobile implementation                 | No priority sorting                               | Add sort + limit                |
| NEXT-ACTION-010 | MEDIUM   | Architecture                          | Mobile uses parallel logic instead of backend API | Call backend aiAssistantService |

---

## 9. Missing Action Logic Details

### Critical Missing Actions:

1. **fund_deal**: Should appear when deal is `proposed` status
2. **submit_work**: Should appear when deal is `funded` status
3. **release_funds**: Should appear when deal is `submitted` status
4. **review_completed_work**: Should appear when deal is `released` status
5. **respond_to_proposal**: Should appear when provider receives proposal
6. **complete_profile**: Should check bio and skills length

### Current Mobile Logic Coverage:

```
Actions Covered:    4 / 15  (27%)
Actions Missing:    11 / 15 (73%)
```

---

## 10. Test Data Reference

### Sample User States and Expected Actions

```typescript
// User A: New user, no offers, unverified
const userA = {
  verificationLevel: 'unverified',
  offers: [],
  deals: [],
};
// Expected actions:
// - verify_identity (high priority)
// - create_first_offer (medium priority)
// - explore_offers (fallback)
// - explore_requests (fallback)

// User B: Provider with funded deal
const userB = {
  verificationLevel: 'verified',
  offers: [...],
  deals: [{ status: 'funded' }],
};
// Expected actions:
// - submit_work (medium priority)
// - explore_requests (fallback)

// User C: Client with submitted deal
const userC = {
  verificationLevel: 'verified',
  offers: [],
  deals: [{ status: 'submitted', clientId: 'userC' }],
};
// Expected actions:
// - release_funds (medium priority)
// - explore_offers (fallback)
```

---

## 11. How to Verify

### Manual Test Steps

1. **Open /ai/next-action**
   - Verify list of actions displayed
   - Verify NextActionCard renders correctly
   - Verify priority badges shown

2. **Test CTA navigation**
   - Press "Create Your First Offer" card
   - Should navigate to `/offers/create`
   - **BUG**: Currently does nothing (NEXT-ACTION-005)

3. **Test Home screen**
   - Open Home tab
   - **BUG**: No next actions shown (NEXT-ACTION-001)

4. **Test Profile screen**
   - Open Profile tab with unverified account
   - **BUG**: No "Verify Identity" action shown (NEXT-ACTION-002)

5. **Test empty state**
   - Have all actions completed
   - Should show "No actions right now"

6. **Test refresh**
   - Pull down to refresh
   - Should reload actions

---

## QA Sign-off

- [ ] Home screen displays next actions ❌ FAIL
- [ ] Profile screen displays next actions ❌ FAIL
- [ ] Deal detail displays next actions ❌ FAIL
- [x] /ai/next-action screen displays next actions ✅ PASS
- [ ] CTA navigation works ❌ FAIL (empty handler)
- [x] Fallback mode works ✅ PASS
- [ ] No duplicate suggestions ❌ PARTIAL (static IDs)

**Status**: ❌ FAIL - 5 Critical bugs, 3 Medium bugs, 2 Low issues

**Recommendation**:

1. Connect mobile to backend aiAssistantService API instead of parallel logic
2. Add missing NextAction sections to Home, Profile, Deal Detail
3. Fix CTA navigation handler
4. Add priority sorting and limit
5. Implement all 15 action types
