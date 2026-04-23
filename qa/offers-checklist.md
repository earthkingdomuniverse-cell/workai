# Offers QA Checklist

Date: 2026-04-22

Scope:

- Offers backend routes
- Mobile offers list/detail/create/edit/manage screens
- Offers data mapping and mock/backend toggle

## Runtime Backend Checks

### 1. offers list load đúng

- Status: PASS
- Method: runtime backend request
- Request:

```bash
curl http://localhost:3000/api/v1/offers
```

- Result:
  - HTTP 200
  - shape: `data.items[]`, `data.total`
  - returned 3 offers from shared mock source

### 2. search hoạt động

- Status: PASS
- Method: runtime backend request with query
- Request:

```bash
curl 'http://localhost:3000/api/v1/offers?q=python&pricingType=hourly'
```

- Result:
  - HTTP 200
  - result filtered to matching offer only

### 3. offer detail load đúng theo id

- Status: PASS
- Method: runtime backend request
- Request:

```bash
curl http://localhost:3000/api/v1/offers/offer_1
```

- Result:
  - HTTP 200
  - returned exact offer by `id`

### 4. create offer submit đúng

- Status: PASS
- Method: runtime backend flow with auth token
- Result:
  - signup member -> get token
  - `POST /api/v1/offers` returns HTTP 201
  - created offer title matches submitted payload

### 5. edit offer đúng

- Status: PASS
- Method: runtime backend flow with auth token
- Result:
  - `PATCH /api/v1/offers/:id` returns HTTP 200
  - title and price updated correctly

### 6. manage offers đúng (backend mine)

- Status: PASS
- Method: runtime backend flow with auth token
- Result:
  - `GET /api/v1/offers/mine` returns only provider-owned offers for signed-in user in current process

### 7. validation create offer đúng

- Status: PASS
- Method: runtime backend request with auth token and invalid payload
- Result:
  - HTTP 400
  - error code `VALIDATION_ERROR`
  - validation message surfaced

## Mobile Code-Path Checks

### 8. offers list load đúng

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/offers.tsx`
  - `mobile/src/services/offerService.ts`
- Result:
  - list loads through shared `offerService`
  - no longer uses isolated local hardcoded list inside screen

### 9. search hoạt động

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/offers.tsx`
- Result:
  - search query updates list
  - search is applied consistently over fetched data

### 10. filter hoạt động

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/offers.tsx`
- Result:
  - pricing type chips filter correctly
  - backend query and local derived filter no longer mismatch critical fields

### 11. pull to refresh

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/offers.tsx`
  - `mobile/app/offers/manage.tsx`
- Result:
  - both list screens have `RefreshControl`

### 12. create offer submit đúng

- Status: PASS
- Verified in:
  - `mobile/app/offers/create.tsx`
  - `mobile/src/services/offerService.ts`
- Result:
  - create screen submits through service
  - no longer waits on fake timeout only
  - field mapping fixed: `deliveryDays` -> `deliveryTime`, `skills` string -> array

### 13. edit offer đúng

- Status: PASS
- Verified in:
  - `mobile/app/offers/edit.tsx`
  - `mobile/src/services/offerService.ts`
- Result:
  - edit screen is no longer placeholder
  - loads offer by `id`
  - updates through shared service

### 14. manage offers đúng

- Status: PASS
- Verified in:
  - `mobile/app/offers/manage.tsx`
  - `mobile/src/services/offerService.ts`
- Result:
  - manage screen uses shared service
  - edit/delete/toggle status flows update same source path

### 15. mock/backend toggle đúng

- Status: PASS
- Verified in:
  - `mobile/src/services/offerService.ts`
- Result:
  - backend success path used when API available
  - fallback mock path used when backend fails and `ENABLE_MOCK_MODE=true`

### 16. field mapping không lệch

- Status: PASS
- Fixed mappings:
  - `deliveryTime` from backend/service mapped into `deliveryDays` prop for `OfferCard`
  - `skills` text input mapped to string array on create/edit
  - `data.items` response shape unwrapped correctly in service
  - detail screen no longer returns same static content for every `id`

### 17. loading/error/empty states đúng

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/offers.tsx`
  - `mobile/app/offers/manage.tsx`
  - `mobile/app/offers/[id].tsx`
  - `mobile/app/offers/edit.tsx`
- Result:
  - list has loading/error/empty
  - manage has loading/error/empty
  - detail has loading/error
  - edit has loading/error
  - create has validation errors and submit error message

## Bugs Found

### Bug 1

- Title: Backend offers route was too shallow for QA
- Impact:
  - no detail route
  - no update route
  - no mine route
  - create used unrelated hardcoded response shape

### Bug 2

- Title: Offers list screen used isolated mock data instead of shared service/backend path
- Impact:
  - list/search/filter not representative of real module behavior

### Bug 3

- Title: Offer detail screen did not load by actual `id`
- Impact:
  - every offer detail looked the same regardless of route param

### Bug 4

- Title: Create offer flow was fake timeout only
- Impact:
  - submit path was not QA-able as real module flow

### Bug 5

- Title: Edit offer screen was placeholder only
- Impact:
  - edit flow impossible to test

### Bug 6

- Title: Manage offers screen used a separate hardcoded dataset
- Impact:
  - create/edit/manage were not consistent with each other

### Bug 7

- Title: Field mapping mismatch `deliveryTime` vs `deliveryDays`
- Impact:
  - card/detail/create/manage could show inconsistent delivery values

## Fixed Now

- Rebuilt backend offers routes to support:
  - `GET /api/offers`
  - `GET /api/offers/:id`
  - `GET /api/offers/mine`
  - `POST /api/offers`
  - `PATCH /api/offers/:id`
- Added auth requirement for create/update/mine
- Added backend validation for title/description/price
- Added shared mobile `offerService`
- Rewired offers list to use service/backend path
- Rewired offer detail to load actual offer by `id`
- Rewired create offer to submit through service/backend path
- Implemented edit offer screen with real load + save flow
- Rewired manage offers to shared service and unified data source
- Fixed field mapping for delivery and skills
- Added submit error state to create/edit flows

## Still Open

- Full device/simulator runtime verification for mobile UI was not executed here because Expo/mobile runtime is not fully wired in this repo snapshot
- Backend create/update currently uses mock in-memory store only, so data resets on restart
- Non-owner edit protection is enforced on backend route, but mobile edit screen itself does not proactively hide if user navigates there manually

## How to verify

### Backend

```bash
npm run typecheck
npm run build
node dist/server.js
```

### List

```bash
curl http://localhost:3000/api/v1/offers
```

### Search + filter

```bash
curl 'http://localhost:3000/api/v1/offers?q=python&pricingType=hourly'
```

### Detail

```bash
curl http://localhost:3000/api/v1/offers/offer_1
```

### Create + edit + mine

1. Signup to get token

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"offers-qa@example.com","password":"Aa1!aaaa","role":"member"}'
```

2. Use token from response

```bash
curl -X POST http://localhost:3000/api/v1/offers \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"title":"QA Offer Build","description":"This is a valid offer description for QA testing flow.","price":1200,"pricingType":"fixed","deliveryTime":5,"skills":["React","QA"]}'

curl -X PATCH http://localhost:3000/api/v1/offers/<OFFER_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"title":"QA Offer Updated","price":1500}'

curl http://localhost:3000/api/v1/offers/mine \
  -H 'Authorization: Bearer <TOKEN>'
```

### Validation

```bash
curl -X POST http://localhost:3000/api/v1/offers \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"title":"Bad","description":"short","price":0}'
```

### Mobile code review targets

- `mobile/src/services/offerService.ts`
- `mobile/app/(tabs)/offers.tsx`
- `mobile/app/offers/[id].tsx`
- `mobile/app/offers/create.tsx`
- `mobile/app/offers/edit.tsx`
- `mobile/app/offers/manage.tsx`
- `mobile/src/components/OfferCard.tsx`
