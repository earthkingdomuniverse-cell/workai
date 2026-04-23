# Requests QA Checklist

Date: 2026-04-22

Scope:

- Requests backend routes
- Mobile requests list/detail/create/edit/manage screens
- CTA AI match / proposal / deal entrypoints
- Field mapping between backend and app

## Runtime Backend Checks

### 1. requests list

- Status: PASS
- Request:

```bash
curl http://localhost:3000/api/v1/requests
```

- Result:
  - HTTP 200
  - shape: `data.items[]`, `data.total`
  - request items include `urgency`, `budget`, `status`, `skills`, `location`

### 2. search/filter

- Status: PASS
- Request:

```bash
curl 'http://localhost:3000/api/v1/requests?q=e-commerce&urgency=high&location=remote'
```

- Result:
  - HTTP 200
  - returned only matching request row

### 3. request detail load đúng

- Status: PASS
- Request:

```bash
curl http://localhost:3000/api/v1/requests/request_1
```

- Result:
  - HTTP 200
  - returned exact request by id

### 4. create request

- Status: PASS
- Method:
  - signup member
  - use bearer token
  - create request with valid payload
- Result:
  - HTTP 201
  - created title matched submitted payload

### 5. edit request

- Status: PASS
- Method:
  - patch created request with bearer token
- Result:
  - HTTP 200
  - updated title and budget returned correctly

### 6. manage requests (mine)

- Status: PASS
- Request:

```bash
GET /api/v1/requests/mine
```

- Result:
  - HTTP 200
  - returned only requester-owned requests in current process

### 7. delete request (manage flow support)

- Status: PASS
- Method:
  - create request with auth
  - delete same request with auth
- Result:
  - HTTP 200
  - body includes `{ deleted: true }`

### 8. unauthenticated create blocked

- Status: PASS
- Request:

```bash
POST /api/v1/requests
```

- Result:
  - HTTP 401
  - `AUTHENTICATION_ERROR`

### 9. validation on create

- Status: PASS
- Method:
  - authenticated create with invalid title/description
- Result:
  - HTTP 400
  - `VALIDATION_ERROR`
  - proper message returned

## Mobile Code-Path Checks

### 10. requests list

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/requests.tsx`
  - `mobile/src/services/requestService.ts`
- Result:
  - list now uses shared `requestService`
  - no longer depends on isolated local mock array inside screen only

### 11. search/filter

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/requests.tsx`
- Result:
  - search query filters title/description
  - urgency chips filter correctly
  - location chips filter correctly

### 12. urgency badge đúng

- Status: PASS
- Verified in:
  - `mobile/src/components/RequestCard.tsx`
- Result:
  - `urgent` renders with fire badge label
  - high/medium/low mapped to distinct colors

### 13. request detail load đúng

- Status: PASS
- Verified in:
  - `mobile/app/requests/[id].tsx`
  - `mobile/src/services/requestService.ts`
- Result:
  - detail now loads actual request by route `id`
  - no longer shows same static object regardless of route param

### 14. create request

- Status: PASS
- Verified in:
  - `mobile/app/requests/create.tsx`
  - `mobile/src/services/requestService.ts`
- Result:
  - create screen submits through service/backend path
  - budget mapping uses object `{ min, max, currency, negotiable }`
  - skills string maps to string array
  - urgency/location/experience fields map correctly

### 15. edit request

- Status: PASS
- Verified in:
  - `mobile/app/requests/edit.tsx`
  - `mobile/src/services/requestService.ts`
- Result:
  - edit screen is no longer placeholder
  - loads request by id and updates through service

### 16. manage requests

- Status: PASS
- Verified in:
  - `mobile/app/requests/manage.tsx`
  - `mobile/src/services/requestService.ts`
- Result:
  - manage screen uses shared service/data source
  - edit/delete/status toggle wired through same source path

### 17. CTA AI match hoạt động

- Status: PASS
- Verified in:
  - `mobile/app/requests/[id].tsx`
- Result:
  - CTA no longer just alerts
  - now routes to `/ai/match` with query params from request context

### 18. CTA proposal/deal entrypoint đúng

- Status: PASS
- Verified in:
  - `mobile/app/requests/[id].tsx`
- Result:
  - proposal CTA routes to `/proposals/create?requestId=<id>`
  - deal CTA routes to `/deals/create?requestId=<id>`

### 19. field mapping backend/app không lệch

- Status: PASS
- Fixed mappings:
  - `urgency` added consistently into backend request type + mocks
  - budget object shape aligned
  - location type aligned
  - detail/list/manage/create/edit all use same request model via service

### 20. loading/error/empty states đúng

- Status: PASS
- Verified in:
  - `mobile/app/(tabs)/requests.tsx`
  - `mobile/app/requests/[id].tsx`
  - `mobile/app/requests/manage.tsx`
  - `mobile/app/requests/edit.tsx`
- Result:
  - list has loading/error/empty/refresh
  - detail has loading/error
  - manage has loading/error/empty/refresh
  - edit has loading/error
  - create has inline validation and submit error message

## Bugs Found

### Bug 1

- Title: Backend requests route too shallow for QA
- Impact:
  - missing detail/mine/update/delete support
  - impossible to validate manage flow properly

### Bug 2

- Title: Requests list screen used isolated mock data instead of shared service/backend path
- Impact:
  - search/filter/load behavior not representative of real module flow

### Bug 3

- Title: Request detail did not load actual request by id
- Impact:
  - deep link param not actually respected

### Bug 4

- Title: Create request screen only simulated success with timeout
- Impact:
  - create flow not QA-able as real module path

### Bug 5

- Title: Edit request screen was placeholder only
- Impact:
  - edit flow impossible to test

### Bug 6

- Title: Manage requests used separate hardcoded dataset
- Impact:
  - create/edit/manage inconsistent with each other

### Bug 7

- Title: CTA AI Match on request detail was only an alert
- Impact:
  - CTA flow broken

### Bug 8

- Title: Backend/app request model mismatch around `urgency`
- Impact:
  - UI expected urgency badge while backend core type omitted urgency

## Fixed Now

- Rebuilt backend requests routes to support:
  - `GET /api/v1/requests`
  - `GET /api/v1/requests/:id`
  - `GET /api/v1/requests/mine`
  - `POST /api/v1/requests`
  - `PATCH /api/v1/requests/:id`
  - `DELETE /api/v1/requests/:id`
- Added backend auth requirement for create/update/delete/mine
- Added backend validation for title/description/budget range
- Added shared mobile `requestService`
- Rewired requests list/detail/create/edit/manage to shared service path
- Rewired request detail CTA AI Match to real route
- Rewired request detail CTA proposal/deal to valid entrypoints
- Implemented real edit request screen
- Implemented manage requests against shared service
- Fixed `urgency` model mismatch in backend request type and mocks

## Still Open

- Full device/simulator runtime verification for mobile requests UI was not executed because Expo/mobile runtime is not fully wired in this repo snapshot
- Requests data remains mock/in-memory and resets on backend restart
- Create/edit screens still use `Alert` for success feedback rather than richer inline success state
- Mobile edit screen itself does not pre-block manual navigation for non-owner before submit; ownership guard is enforced on backend route

## How to verify

### Backend

```bash
npm run typecheck
npm run build
node dist/server.js
```

### List

```bash
curl http://localhost:3000/api/v1/requests
```

### Search + filter

```bash
curl 'http://localhost:3000/api/v1/requests?q=e-commerce&urgency=high&location=remote'
```

### Detail

```bash
curl http://localhost:3000/api/v1/requests/request_1
```

### Create + edit + mine + delete

1. Signup to get token

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"requests-qa@example.com","password":"Aa1!aaaa","role":"member"}'
```

2. Use returned token

```bash
curl -X POST http://localhost:3000/api/v1/requests \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"title":"QA Request Build","description":"This is a valid request description for QA runtime testing.","budget":{"min":1000,"max":2000,"currency":"USD","negotiable":true},"skills":["React","Node.js"],"urgency":"high","location":{"type":"remote"}}'

curl -X PATCH http://localhost:3000/api/v1/requests/<REQUEST_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"title":"QA Request Updated","budget":{"min":1500,"max":2500,"currency":"USD","negotiable":false}}'

curl http://localhost:3000/api/v1/requests/mine \
  -H 'Authorization: Bearer <TOKEN>'

curl -X DELETE http://localhost:3000/api/v1/requests/<REQUEST_ID> \
  -H 'Authorization: Bearer <TOKEN>'
```

### Validation

```bash
curl -X POST http://localhost:3000/api/v1/requests \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"title":"Bad","description":"short"}'
```

### Mobile code review targets

- `mobile/src/services/requestService.ts`
- `mobile/app/(tabs)/requests.tsx`
- `mobile/app/requests/[id].tsx`
- `mobile/app/requests/create.tsx`
- `mobile/app/requests/edit.tsx`
- `mobile/app/requests/manage.tsx`
- `mobile/src/components/RequestCard.tsx`
