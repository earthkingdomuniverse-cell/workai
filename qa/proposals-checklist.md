# Proposals QA Checklist

Date: 2026-04-23

Scope:
- Proposal create flow from request detail
- Proposal detail
- My proposals
- Status rendering
- Accept / reject flows
- Amount / delivery field mapping
- Proposal to deal handoff behavior

## Runtime Backend Checks

### 1. Create proposal từ request detail path
- Status: PASS
- App entrypoint checked in code:
  - `mobile/app/requests/[id].tsx`
  - CTA routes to `/proposals/create?requestId=<id>`
- Backend runtime checked with authenticated create:

```bash
POST /api/v1/proposals
```

- Payload used:

```json
{
  "requestId": "request_1",
  "title": "QA Proposal Build",
  "message": "This is a valid QA proposal message that exceeds twenty characters.",
  "proposedAmount": 2100,
  "estimatedDeliveryDays": 6,
  "currency": "USD"
}
```

- Result:
  - HTTP 201
  - proposal created successfully
  - `clientId` now resolves to request owner (`user_2`) instead of incorrectly storing `requestId`

### 2. Proposal detail load đúng
- Status: PASS
- Runtime request:

```bash
GET /api/v1/proposals/:id
```

- Result:
  - HTTP 200
  - returned exact proposal
  - verified fields:
    - `proposedAmount = 2100`
    - `estimatedDeliveryDays = 6`

### 3. My proposals load đúng
- Status: PASS
- Runtime request:

```bash
GET /api/v1/proposals/mine
```

- Result:
  - HTTP 200 with auth
  - created proposal appears in provider-owned list

### 4. My proposals auth guard
- Status: PASS
- Runtime request:

```bash
GET /api/v1/proposals/mine
```

- Without auth result:
  - HTTP 401
  - `AUTHENTICATION_ERROR`

### 5. Accept flow đúng
- Status: PASS
- Runtime flow:
  - provider creates proposal for `request_1`
  - provider tries accept -> blocked
  - request owner token accepts -> success
- Result:
  - provider accept attempt => HTTP 403 `FORBIDDEN`
  - request owner accept attempt => HTTP 200
  - returned status => `accepted`

### 6. Reject flow đúng
- Status: PASS
- Runtime flow:
  - provider creates proposal for `request_1`
  - request owner rejects proposal
- Result:
  - HTTP 200
  - returned status => `rejected`

### 7. Validation proposal create
- Status: PASS
- Runtime invalid payload:

```json
{
  "title": "Bad",
  "message": "short",
  "proposedAmount": 0,
  "estimatedDeliveryDays": 0
}
```

- Result:
  - HTTP 400
  - `VALIDATION_ERROR`
  - message specific enough (`Title must be at least 5 characters`)

## Mobile Code-Path Checks

### 8. Proposal detail screen load đúng
- Status: PASS
- Verified in:
  - `mobile/app/proposals/[id].tsx`
- Result:
  - loading state exists
  - not-found/error fallback exists
  - detail fields render from fetched proposal

### 9. My proposals screen load đúng
- Status: PASS
- Verified in:
  - `mobile/app/proposals/mine.tsx`
- Result:
  - list uses service path
  - loading state exists
  - error state exists
  - empty state exists
  - pull to refresh exists

### 10. Proposal status hiển thị đúng
- Status: PASS
- Verified in:
  - `mobile/src/components/ProposalCard.tsx`
  - `mobile/app/proposals/mine.tsx`
- Result:
  - supported in card UI:
    - pending
    - accepted
    - rejected
    - expired
    - withdrawn
  - `expired` filter/status support added to my proposals flow

### 11. Proposal amount / delivery fields đúng
- Status: PASS
- Verified in:
  - `mobile/src/components/ProposalCard.tsx`
  - `mobile/app/proposals/[id].tsx`
  - backend runtime detail response
- Result:
  - amount formatted as currency
  - delivery rendered as days
  - values match backend fields

### 12. Accept / reject UI flow đúng nếu có
- Status: PASS
- Verified in:
  - `mobile/app/proposals/[id].tsx`
- Result:
  - client-only action logic derived from `proposal.clientId`
  - provider-only withdraw logic derived from `proposal.providerId`
  - pending-only action gating exists

## Proposal-to-Deal Handoff

### 13. Proposal accepted -> deal handoff
- Status: FAIL / OPEN
- Checked:
  - mobile accept flow message
  - backend accept flow runtime
  - deals list count after accept

- Result:
  - proposal status changes to `accepted`
  - but no new deal is actually created in `/api/v1/deals`
  - existing mobile screen previously claimed “A deal has been created”

## Mismatch Found

### Mismatch 1
- Area: backend proposals create
- Field mismatch:
  - `clientId` was previously set to `requestId` / `offerId`
  - should be the counterparty user id
- Impact:
  - accept/reject permission logic broke

### Mismatch 2
- Area: app proposal detail success message
- App said:
  - accepting proposal creates deal
- Actual backend behavior:
  - status only changes to `accepted`
  - no deal created

### Mismatch 3
- Area: status support
- App filter UI previously omitted `expired` even though proposal model supported it

## Bugs Found

### Bug 1
- Title: Proposal `clientId` resolution was wrong at create time
- File:
  - `src/modules/proposal/routes.ts`
- Root cause likely:
  - route used `requestId` / `offerId` string directly as `clientId`
- Impact:
  - accept/reject authz broken

### Bug 2
- Title: Proposal detail screen falsely reported deal creation on accept
- File:
  - `mobile/app/proposals/[id].tsx`
- Root cause likely:
  - UI message got ahead of actual backend behavior
- Impact:
  - misleading success state

### Bug 3
- Title: My proposals filter omitted `expired`
- File:
  - `mobile/app/proposals/mine.tsx`
- Impact:
  - status coverage incomplete in UI

### Bug 4
- Title: Proposal accepted status does not create deal handoff
- Files involved:
  - `src/modules/proposal/service.ts`
  - `src/routes/deals.ts`
  - `mobile/app/proposals/[id].tsx`
- Impact:
  - proposal-to-deal flow not truly connected

## Fixed Now

- Fixed proposal create route to resolve counterparty correctly:
  - request proposal => `clientId = requesterId`
  - offer proposal => `clientId = providerId`
- Added not-found handling when referenced request/offer does not exist during proposal create
- Added `expired` into my proposals status filter UI
- Updated proposal accept success message to remove false deal-created claim

## Still Open

- Proposal accepted -> actual deal creation is still not connected
- Therefore “proposal-to-deal handoff” is not complete end-to-end yet
- The app can navigate into deal creation entrypoints from related flows, but proposal accept itself does not trigger deal creation automatically

## How to verify

### Backend

```bash
npm run typecheck
npm run build
node dist/server.js
```

### Create proposal

1. Signup provider to get token

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"proposal-provider@example.com","password":"Aa1!aaaa","role":"member"}'
```

2. Create proposal for `request_1`

```bash
curl -X POST http://localhost:3000/api/v1/proposals \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <PROVIDER_TOKEN>' \
  -d '{"requestId":"request_1","title":"QA Proposal Build","message":"This is a valid QA proposal message that exceeds twenty characters.","proposedAmount":2100,"estimatedDeliveryDays":6,"currency":"USD"}'
```

### Detail

```bash
curl http://localhost:3000/api/v1/proposals/<PROPOSAL_ID>
```

### Mine

```bash
curl http://localhost:3000/api/v1/proposals/mine \
  -H 'Authorization: Bearer <PROVIDER_TOKEN>'
```

### Accept / reject authz

Provider accept should fail:

```bash
curl -X POST http://localhost:3000/api/v1/proposals/<PROPOSAL_ID>/accept \
  -H 'Authorization: Bearer <PROVIDER_TOKEN>'
```

Request owner accept should pass:

```bash
curl -X POST http://localhost:3000/api/v1/proposals/<PROPOSAL_ID>/accept \
  -H 'Authorization: Bearer <CLIENT_TOKEN>'
```

Reject should pass similarly with client token.

### Validation

```bash
curl -X POST http://localhost:3000/api/v1/proposals \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <PROVIDER_TOKEN>' \
  -d '{"title":"Bad","message":"short","proposedAmount":0,"estimatedDeliveryDays":0}'
```

### App code review targets

- `mobile/app/requests/[id].tsx`
- `mobile/app/proposals/create.tsx`
- `mobile/app/proposals/[id].tsx`
- `mobile/app/proposals/mine.tsx`
- `mobile/src/components/ProposalCard.tsx`
- `mobile/src/services/proposalService.ts`
- `src/modules/proposal/routes.ts`
- `src/modules/proposal/service.ts`
