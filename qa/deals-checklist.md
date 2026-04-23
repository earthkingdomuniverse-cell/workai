# Deals QA Checklist

Date: 2026-04-23

Scope:

- Deals backend routes and transition rules
- Mobile deals list/detail/timeline/payment/dispute flows
- Status rendering and allowed actions by status

## Runtime Backend Checks

### 1. deals list load đúng

- Status: PASS
- Request:

```bash
curl http://localhost:3000/api/v1/deals
```

- Result:
  - HTTP 200
  - `data.items` returned
  - deals count = 4 in current runtime seed

### 2. deal detail load đúng

- Status: PASS
- Request:

```bash
curl http://localhost:3000/api/v1/deals/deal_1
```

- Result:
  - HTTP 200
  - title matched `E-commerce Website Development`
  - detail includes `status`, `fundedAmount`, `releasedAmount`, `milestones`, `timeline`

### 3. fund flow đúng

- Status: PASS
- Runtime flow:
  - deal_1 starts at `created`
  - fund as client `user_2`

- Result:
  - HTTP 200
  - status -> `funded`
  - `fundedAmount` -> `12000`
  - timeline appended payment event

### 4. submit flow đúng

- Status: PASS
- Runtime flow:
  - deal_1 funded
  - submit as provider `user_1` with `milestoneId=milestone_1`

- Result:
  - HTTP 200
  - status -> `submitted`
  - milestone updated to completed
  - timeline appended milestone update event

### 5. release flow đúng

- Status: PASS
- Runtime flow:
  - deal_1 submitted
  - release as client `user_2`

- Result:
  - HTTP 200
  - status -> `released`
  - `releasedAmount` -> `12000`
  - timeline appended release event

### 6. dispute flow đúng

- Status: PASS
- Runtime flow:
  - deal_1 released
  - dispute opened by provider `user_1`

- Result:
  - HTTP 200
  - status -> `disputed`
  - dispute object created
  - timeline appended dispute event

### 7. invalid transition bị chặn đúng

- Status: PASS

#### Case A: release before submit

- deal_1 at `created`
- client tries `POST /deals/deal_1/release`
- Result:
  - HTTP 400
  - message: `Cannot transition deal from created to released`

#### Case B: submit after released

- deal_4 at `released`
- correct provider tries `POST /deals/deal_4/submit`
- Result:
  - HTTP 400
  - message: `Cannot transition deal from released to submitted`

### 8. permission guard on transitions

- Status: PASS

#### Case: wrong participant tries submit

- non-owner provider token on released deal route test initially returned 403
- Result:
  - backend authz present on action routes

## Mobile Code-Path Checks

### 9. deals list load đúng

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/deals.tsx`
  - `mobile/src/services/dealService.ts`
- Result:
  - list now uses `dealService`
  - loading state exists
  - error state exists
  - empty state exists
  - pull to refresh exists

### 10. deal detail load đúng

- Status: PASS
- Verified in:
  - `mobile/app/deals/[id].tsx`
- Result:
  - detail now loads by `id` through `dealService.getDeal`
  - no longer uses static hardcoded mock inside screen only
  - loading/error states exist

### 11. status badge đúng

- Status: PASS
- Verified in:
  - `mobile/src/components/DealCard.tsx`
  - `mobile/app/deals/[id].tsx`
- Result:
  - status color/label mappings cover:
    - created
    - funded
    - submitted
    - released
    - disputed
    - refunded
    - under_review

### 12. allowed actions theo status đúng

- Status: PASS
- Verified in:
  - `mobile/app/deals/[id].tsx`
- Result:
  - `created` + client => Fund Deal
  - `funded` + provider => Submit Work
  - `submitted` + client => Release Funds
  - `funded/submitted/released` + participant => Open Dispute
- Additional fix:
  - action visibility now also checks participant role in app layer, not status only

### 13. payment/fund UI flow

- Status: PASS (code-path)
- Verified in:
  - `mobile/app/deals/payment.tsx`
- Result:
  - payment screen now calls `dealService.fundDeal()`
  - inline error message exists
  - processing state exists

### 14. dispute UI flow

- Status: PASS (code-path)
- Verified in:
  - `mobile/app/deals/dispute.tsx`
- Result:
  - dispute screen now calls `dealService.createDispute()`
  - input validation exists
  - submitting state exists
  - inline error exists

### 15. timeline render đúng theo history/state

- Status: PASS
- Verified in:
  - `mobile/app/deals/timeline.tsx`
  - `mobile/src/components/TimelineItem.tsx`
- Result:
  - timeline screen can fetch via `dealId`
  - renders timeline items from backend deal history
  - empty state exists when no timeline events

## Bugs Found

### Bug 1

- Title: Backend deals route was too shallow for real transition QA
- File:
  - `src/routes/deals.ts`
- Impact:
  - no real transition validation
  - no authz on state changes
  - no timeline updates
  - dispute payload not validated

### Bug 2

- Title: Mobile deal service parsed backend list/detail shape incorrectly
- File:
  - `mobile/src/services/dealService.ts`
- Impact:
  - list/detail/actions could misread API response

### Bug 3

- Title: Deal detail screen used static mock instead of route `id` data
- File:
  - `mobile/app/deals/[id].tsx`
- Impact:
  - detail did not reflect actual backend state or history

### Bug 4

- Title: Action visibility in deal detail was status-only, not participant-aware
- File:
  - `mobile/app/deals/[id].tsx`
- Impact:
  - wrong user could see action buttons in app layer

### Bug 5

- Title: Payment and dispute screens were pseudo-only and not connected to backend transitions
- Files:
  - `mobile/app/deals/payment.tsx`
  - `mobile/app/deals/dispute.tsx`
- Impact:
  - fund/dispute QA flow not real

### Bug 6

- Title: DealCard avatar placeholder logic only rendered avatar when `avatarUrl` existed
- File:
  - `mobile/src/components/DealCard.tsx`
- Impact:
  - provider visual hierarchy degraded for users without avatar

## Fixed Now

- Rebuilt backend deals route with:
  - real transition validation
  - participant authz checks
  - dispute payload validation
  - timeline updates on create/fund/submit/release/dispute
  - list filtering support
- Fixed mobile deal service response parsing
- Rewrote deal detail to load real backend data by `id`
- Rewrote timeline screen to fetch timeline by `dealId`
- Connected payment screen to `fundDeal()` backend flow
- Connected dispute screen to `createDispute()` backend flow
- Added participant-aware action gating in deal detail
- Fixed DealCard avatar placeholder rendering

## Still Open

- Full device/simulator runtime verification for mobile deals UI is not executed in this repo snapshot because Expo/mobile runtime is not fully wired here
- Deal detail uses alert-based error feedback for submit/release actions rather than persistent inline banners
- Payment screen still uses pseudo card input data; processor is not real, but transition/state consistency is now tested against backend

## How to verify

### Backend

```bash
npm run typecheck
npm run build
node dist/server.js
```

### List and detail

```bash
curl http://localhost:3000/api/v1/deals
curl http://localhost:3000/api/v1/deals/deal_1
```

### Generate participant tokens

```bash
node - <<'NODE'
(async () => {
  const { generateAccessToken } = require('./dist/modules/auth/token');
  console.log('client user_2', await generateAccessToken({ userId: 'user_2', email: 'client@example.com', role: 'member' }));
  console.log('provider user_1', await generateAccessToken({ userId: 'user_1', email: 'provider@example.com', role: 'member' }));
})();
NODE
```

### Fund / submit / release / dispute

```bash
curl -X POST http://localhost:3000/api/v1/deals/deal_1/fund \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <CLIENT_TOKEN>' \
  -d '{"amount":12000,"paymentMethodId":"pm_test_4242"}'

curl -X POST http://localhost:3000/api/v1/deals/deal_1/submit \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <PROVIDER_TOKEN>' \
  -d '{"milestoneId":"milestone_1","notes":"Submitting milestone one"}'

curl -X POST http://localhost:3000/api/v1/deals/deal_1/release \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <CLIENT_TOKEN>' \
  -d '{"amount":12000,"notes":"Releasing final funds"}'

curl -X POST http://localhost:3000/api/v1/deals/deal_1/dispute \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <PROVIDER_TOKEN>' \
  -d '{"reason":"Post-release dispute","description":"Need to open dispute after release for QA."}'
```

### Invalid transition

```bash
curl -X POST http://localhost:3000/api/v1/deals/deal_4/submit \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <USER_4_PROVIDER_TOKEN>' \
  -d '{"milestoneId":"milestone_9","notes":"Attempt submit after release"}'
```

Expected:

- HTTP 400
- `Cannot transition deal from released to submitted`

### Mobile code review targets

- `mobile/src/services/dealService.ts`
- `mobile/app/(tabs)/deals.tsx`
- `mobile/app/deals/[id].tsx`
- `mobile/app/deals/timeline.tsx`
- `mobile/app/deals/payment.tsx`
- `mobile/app/deals/dispute.tsx`
- `mobile/src/components/DealCard.tsx`
- `mobile/src/components/TimelineItem.tsx`
