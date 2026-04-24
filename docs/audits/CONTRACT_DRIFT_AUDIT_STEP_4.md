# WorkAI Contract Drift Audit - Step 4

## Purpose

Audit drift between:

1. Backend endpoint contracts.
2. Mobile service expectations.
3. Shared response wrapper shape.
4. Mock/fallback behavior.

This audit is based on source inspection, not runtime execution.

## Files inspected or referenced

Backend:

- `src/lib/response.ts`
- `src/routes/offers.ts`
- `src/routes/requests.ts`
- `src/modules/proposal/routes.ts`
- `src/routes/deals.ts`
- `src/routes/ai.ts`
- `src/routes/transactions.ts`
- `src/routes/trust.ts`
- `src/routes/reviews.ts`
- `src/routes/recommendations.ts`

Mobile:

- `mobile/src/services/apiClient.ts`
- `mobile/src/services/offerService.ts`
- `mobile/src/services/requestService.ts`
- `mobile/src/services/proposalService.ts`
- `mobile/src/services/dealService.ts`
- `mobile/src/services/aiService.ts`
- `mobile/src/services/notificationService.ts`
- `mobile/app/(tabs)/home.tsx`
- `mobile/app/admin/overview.tsx`

---

# 1. Global response shape contract

## Backend contract

Backend `successResponse(reply, data, meta)` returns:

```ts
{
  data: T,
  meta: {
    ...meta,
    timestamp: string
  }
}
```

Backend `createdResponse(reply, data)` returns:

```ts
{
  data: T,
  meta: {
    timestamp: string
  }
}
```

## Mobile apiClient behavior

`mobile/src/services/apiClient.ts` parses JSON and returns it directly:

```ts
const data = await response.json();
return data;
```

So mobile service response should usually be read as:

```ts
const response = await apiClient.get<{ data: SomeType }>('/endpoint');
return response.data;
```

For list endpoints:

```ts
const response = await apiClient.get<{ data: { items: Item[]; total: number } }>('/endpoint');
return response.data.items;
```

## Drift found

Several mobile services treat the result as if `apiClient` returned an Axios response:

```ts
return response.data?.data?.items;
```

That is likely wrong because custom `apiClient` already returns the backend body.

## Affected services

- `proposalService.ts`
- `aiService.ts`
- `notificationService.ts`

`dealService.ts` mostly uses `response.data`, which aligns better with backend wrapper.

## Severity

`P0`

This can cause mobile screens to render empty data even when backend returns valid data.

---

# 2. apiClient import/export drift

## Current apiClient export

`mobile/src/services/apiClient.ts` exports:

```ts
export const apiClient = new ApiClient(API_URL);
```

No default export was found in the inspected file.

## Services using named import correctly

- `offerService.ts`: `import { apiClient } from './apiClient';`
- `requestService.ts`: `import { apiClient } from './apiClient';`

## Services using default import incorrectly

- `proposalService.ts`: `import apiClient from './apiClient';`
- `dealService.ts`: `import apiClient from './apiClient';`
- `aiService.ts`: `import apiClient from './apiClient';`
- `notificationService.ts`: `import apiClient from './apiClient';`

## Severity

`P0 BUILD_RISK`

If TypeScript/bundler enforces module semantics, these services can fail to compile.

## Recommended fix

Either add default export:

```ts
export default apiClient;
```

or convert all services to:

```ts
import { apiClient } from './apiClient';
```

Recommended cleaner fix: use named imports consistently.

---

# 3. Offer contract drift

## Backend source

`src/routes/offers.ts`

## Mobile source

`mobile/src/services/offerService.ts`

## Matched endpoints

| Mobile method | Backend endpoint | Match |
| --- | --- | --- |
| `getOffers` | `GET /offers` | Yes |
| `getOffer` | `GET /offers/:id` | Yes |
| `getMyOffers` | `GET /offers/mine` | Yes |
| `createOffer` | `POST /offers` | Yes |
| `updateOffer` | `PATCH /offers/:id` | Yes |
| `deleteOffer` | No backend DELETE | No |

## Field drift

Mobile expects:

- `skills`
- `deliveryTime`
- `provider`
- `views`
- `likes`
- `proposalsCount`

Backend `serializeOffer()` returns:

- `skills: []`
- `deliveryTime: undefined`
- no guaranteed provider relation
- no views/likes/proposalsCount in inspected response

## Severity

`P1`

Marketplace can render, but offer cards/detail may be thin or inconsistent.

## Fixes

1. Preserve `skills` and `deliveryTime` in backend if schema supports them.
2. Include provider summary if mobile needs it.
3. Remove or implement `deleteOffer`.
4. Add mobile method for `/offers/:id/buy` if direct buy is official.

---

# 4. Request contract drift

## Backend source

`src/routes/requests.ts`

## Mobile source

`mobile/src/services/requestService.ts`

## Matched endpoints

| Mobile method | Backend endpoint | Match |
| --- | --- | --- |
| `getRequests` | `GET /requests` | Mostly |
| `getRequest` | `GET /requests/:id` | Yes |
| `getMyRequests` | `GET /requests/mine` | Yes |
| `createRequest` | `POST /requests` | Yes |
| `updateRequest` | `PATCH /requests/:id` | Yes |
| `deleteRequest` | `DELETE /requests/:id` | Yes |

## Field drift

Mobile may send/expect:

- `location`
- `deadline`
- `experienceLevel`
- `requester`
- `views`
- `proposalsCount`

Backend route handles:

- `title`
- `description`
- `category`
- `skills`
- `budgetMin/budgetMax/currency`
- `urgency`
- `status`

Backend does not visibly persist or return location/deadline/experienceLevel/requester/views/proposalsCount from inspected route.

## Severity

`P1`

Request CRUD works, but richer UI fields may be empty.

---

# 5. Proposal contract drift

## Backend source

- `src/routes/proposals.ts`
- `src/modules/proposal/routes.ts`

## Mobile source

- `mobile/src/services/proposalService.ts`

## Endpoint match

Endpoint names broadly match:

- list
- detail
- mine
- create
- accept
- reject
- withdraw
- update
- delete

## Critical drifts

### Drift A: backend mock dependency

Backend proposal create resolves target offer/request through:

```ts
getRequestById() from mocks/requests
getOfferById() from mocks/offers
```

But actual offer/request routes use Prisma.

Impact:

- Proposal creation for real Prisma offer/request can fail with `Request not found for proposal` or `Offer not found for proposal`.

### Drift B: response parsing

Mobile uses:

```ts
response.data?.data?.items
response.data?.data
```

Given custom apiClient, expected should likely be:

```ts
response.data.items
response.data
```

### Drift C: mock fallback always on

`USE_MOCK_FALLBACK = true` can hide backend failures even when mock mode is disabled.

## Severity

`P0`

This is a core marketplace conversion flow.

## Fixes

1. Update backend proposals to use Prisma offer/request lookup.
2. Fix mobile response parsing.
3. Replace hardcoded `USE_MOCK_FALLBACK = true` with config-based fallback.
4. Verify accept creates or links to deal according to product decision.

---

# 6. Deal contract drift

## Backend source

`src/routes/deals.ts`

## Mobile source

`mobile/src/services/dealService.ts`

## Endpoint match

| Mobile method | Backend endpoint | Match |
| --- | --- | --- |
| `getDeals` | `GET /deals` | Yes |
| `getDeal` | `GET /deals/:id` | Yes |
| `createDeal` | `POST /deals` | Yes |
| `fundDeal` | `POST /deals/:id/fund` | Yes |
| `submitWork` | `POST /deals/:id/submit` | Yes |
| `releaseFunds` | `POST /deals/:id/release` | Yes |
| `createDispute` | `POST /deals/:id/dispute` | Yes |

## Drifts

### Drift A: `providerId=me` and `clientId=me`

Mobile calls:

```ts
/deals?providerId=me
/deals?clientId=me
```

Backend route treats `providerId` and `clientId` as literal filter values. No special `me` resolution was found.

Impact:

- My deals screens may return empty unless user id literally equals `me`.

### Drift B: rich type expectations

Mobile expects:

- `timeline`
- `views`
- rich provider/client summaries
- request/offer/proposal summary
- dispute single object

Backend returns:

- milestones
- transactions
- disputes
- reviews
- raw relation-dependent fields

No timeline generation found in route.

### Drift C: build/import issue

`dealService.ts` uses default `apiClient` import.

### Drift D: mock fallback always on

Can mask backend deal failures.

## Severity

`P0 / P1`

P0 for import and `me` query mismatch if my-deals UI depends on it. P1 for richer field mismatch.

---

# 7. AI contract drift

## Backend source

`src/routes/ai.ts`

## Mobile source

`mobile/src/services/aiService.ts`

## Matched endpoints

| Mobile method | Backend endpoint | Match |
| --- | --- | --- |
| `match` | `POST /ai/match` | Yes |
| `suggestPrice` | `POST /ai/price` | Yes |
| `support` | `POST /ai/support` | Yes |

## Drifts

1. `aiService.ts` uses default `apiClient` import.
2. Response parsing likely expects `response.data.data` instead of `response.data`.
3. No mobile method for AI next-action.
4. Backend has no AI next-action route found.
5. `USE_MOCK_FALLBACK = true` can hide backend/OpenAI failures.

## Severity

`P1`, with `P0` build risk from import mismatch.

---

# 8. Notification contract drift

## Backend source

No backend `notifications` route found in route registry from Step 1/2.

## Mobile source

`mobile/src/services/notificationService.ts`

## Mobile expects endpoints

- `GET /notifications`
- `POST /notifications/:id/read`
- `POST /notifications/read-all`
- `DELETE /notifications/:id`
- `GET /notifications/unread-count`
- `PATCH /notifications/preferences`
- `GET /notifications/preferences`

## Drifts

1. Backend routes appear missing.
2. Service uses default `apiClient` import.
3. Response parsing likely assumes Axios-like response.
4. Mock fallback is always on.
5. Mock data still says `Welcome to SkillValue`.

## Severity

`P1`, with `P0` build risk from import mismatch.

---

# 9. Admin contract drift

## Backend source

`src/routes/admin.ts` from Step 1:

- `/admin/overview`
- `/admin/disputes`
- `/admin/disputes/:id/resolve`
- `/admin/risk`
- `/admin/risk/:userId`
- `/admin/fraud`
- `/admin/fraud/user/:userId`
- `/admin/reviews`
- `/admin/review`
- `/admin/review/:reviewId/flag`

## Mobile source

- `mobile/app/(tabs)/admin.tsx`
- `mobile/app/admin/overview.tsx`

## Drifts

1. No `mobile/src/services/adminService.ts` found.
2. Admin overview does not call `/admin/overview`.
3. Admin overview computes from deals/offers/requests and hardcoded stats.
4. Admin overview file appears to have duplicated JSX after return, likely build error.

## Severity

`P0`

Admin mobile must compile before admin workflow can be tested.

---

# 10. Transactions / receipts contract drift

## Backend source

`src/routes/transactions.ts`

## Mobile dependency

Mobile deal/payment/receipt screens likely depend on transaction/receipt surfaces, but specific mobile receipt service was not inspected in this step.

## Backend drift from product contract

Backend transaction/receipt routes read mock data:

- `mockTransactions`
- `mockReceipts`

But real deal/payment/wallet routes create Prisma transactions and ledger records.

## Severity

`P0 backend consistency`

Even if mobile calls the right route, it will not see real wallet/deal/payment history.

---

# 11. Trust/review contract drift

## Trust

Backend `/trust/*` is mock-only and `/trust/me` does not authenticate.

Mobile trust/profile views may show static data rather than real user trust.

## Reviews

Backend read endpoints use `mockReviews`; create uses `reviewService`.

Impact:

- User can create review but aggregate/list may not reflect it.

## Severity

`P1`, `P0` if review/trust is part of launch credibility.

---

# 12. Home/recommendation contract drift

## Backend

`/recommendations/home` and `/recommendations/explore` exist but use placeholder profile/skills/interests.

## Mobile

`home.tsx` does not call recommendations endpoint. It creates recommendations locally from offers and requests.

## Severity

`P2`

Not a build blocker, but product claim of AI/native recommendations is not fully reflected in the mobile home implementation.

---

# P0 fix list from contract audit

1. Fix `apiClient` import/export mismatch across services.
2. Fix service response parsing for custom `apiClient`:
   - proposalService
   - aiService
   - notificationService
   - any other Axios-style consumers.
3. Fix `mobile/app/admin/overview.tsx` duplicated JSX/syntax issue.
4. Replace proposal backend mock offer/request lookup with Prisma lookup.
5. Replace transactions/receipts mock reads with Prisma-backed reads.
6. Fix deals `providerId=me` / `clientId=me` mismatch.
7. Gate hardcoded mock fallback with `ENABLE_MOCK_MODE` rather than always true.

# P1 fix list

1. Implement real login/signup screens.
2. Harden deal list/detail auth.
3. Harden payment create/status auth.
4. Implement notification backend or remove fake API calls.
5. Implement adminService and use backend admin endpoints.
6. Connect trust/reviews to real persistence.
7. Preserve/return offer skills and deliveryTime.
8. Align request extra fields or remove unsupported mobile fields.

# Recommended implementation order

## Patch batch 1 - Compile blockers

1. Add default export to `apiClient.ts` or convert services to named import.
2. Fix `admin/overview.tsx` duplicated JSX.
3. Rebrand notification mock string.

## Patch batch 2 - Response parsing

1. Fix `proposalService` response parsing.
2. Fix `aiService` response parsing.
3. Fix `notificationService` response parsing if backend exists later.
4. Standardize API response helper in mobile.

## Patch batch 3 - Backend data-source unification

1. Proposals use Prisma offers/requests.
2. Transactions/receipts use Prisma transactions.
3. Reviews use persisted reviews.
4. Trust computes from persisted data.

## Patch batch 4 - Auth/access control

1. Deal list/detail participant guard.
2. Payment create/status auth guard.
3. Withdraw GET guest guard.
4. Admin mobile deep-link guard.

## Step 4 verdict

WorkAI now has broad backend and mobile surfaces, but several critical contracts are not aligned.

The next practical step should be code patching, not more feature creation. Start with compile blockers and API response parsing, then move to backend data-source unification.
