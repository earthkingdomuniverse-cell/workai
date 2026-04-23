# Reviews QA Checklist

Date: 2026-04-23

Scope:
- Review create flow
- Rating stars behavior
- Comment/tags persistence
- Review eligibility rules
- Profile review aggregate
- Offer detail review list
- Average rating calculation
- Review-related loading/error/empty states

## Runtime Backend Checks

### 1. Submit review flow
- Status: PASS
- Runtime request:

```bash
POST /api/v1/reviews
```

- Valid case used:
  - `dealId = deal_4`
  - reviewer token for `user_1`
  - `subjectType = user`
  - `subjectId = user_4`
  - `rating = 5`
  - valid comment + tags

- Result:
  - HTTP 201
  - review created successfully

### 2. Unauthenticated review blocked
- Status: PASS
- Result:
  - HTTP 401
  - code `AUTHENTICATION_ERROR`

### 3. Duplicate review blocked
- Status: PASS
- Result:
  - second review from same reviewer on same deal returns HTTP 409
  - code `CONFLICT_ERROR`

### 4. Review chỉ xuất hiện khi điều kiện hợp lệ
- Status: PASS (backend rule)
- Checked cases:
  - unreleased deal review attempt (`deal_1`) => blocked
  - non-participant review attempt on released deal => blocked

- Result:
  - unreleased deal => HTTP 400 `BAD_REQUEST_ERROR`
  - non-participant => HTTP 400 `BAD_REQUEST_ERROR`

### 5. Comment / tags lưu đúng
- Status: PASS
- Result:
  - created review returned exact `rating`, `comment`, and `tags`

### 6. Reviews by user
- Status: PASS
- Request:

```bash
GET /api/v1/reviews/by-user/user_4
```

- Result:
  - HTTP 200
  - total count increased to 2 after successful review submit

### 7. Reviews by offer
- Status: PASS
- Request:

```bash
GET /api/v1/reviews/by-offer/offer_1
```

- Result:
  - HTTP 200
  - total count = 1 in current mock/runtime set

### 8. Aggregate review đúng
- Status: PASS
- Requests checked:

```bash
GET /api/v1/reviews/aggregate/user/user_4
GET /api/v1/reviews/aggregate/offer/offer_1
```

- Result:
  - user aggregate for `user_4`:
    - total reviews = 2
    - average rating = 4.0
  - offer aggregate for `offer_1`:
    - total reviews = 1
    - average rating = 5.0

## Mobile Code-Path Checks

### 9. Rating stars hoạt động đúng
- Status: PASS
- Verified in:
  - `mobile/src/components/RatingStars.tsx`
- Result:
  - supports display mode
  - supports editable mode via `onChange`
  - renders 1..5 stars consistently

### 10. Submit review flow in app
- Status: PASS (code-path)
- Verified in:
  - `mobile/app/deals/[id].tsx`
- Result:
  - released deal now shows review form
  - review form includes:
    - editable stars
    - comment input
    - tags input
    - submit action
    - inline review error state

### 11. Offer detail review list đúng
- Status: PASS (code-path)
- Verified in:
  - `mobile/app/offers/[id].tsx`
- Result:
  - loads `getReviewsByOfferId()`
  - loads `getReviewAggregate()`
  - renders aggregate + review list
  - has section-level loading/error/empty handling

### 12. Profile aggregate review đúng
- Status: PASS (code-path)
- Verified in:
  - `mobile/app/(tabs)/profile.tsx`
- Result:
  - profile now loads review aggregate for current user
  - renders average rating with `RatingStars`
  - shows total review count

### 13. Average rating render đúng
- Status: PASS
- Verified in:
  - `mobile/src/components/RatingStars.tsx`
  - `mobile/app/offers/[id].tsx`
  - `mobile/app/(tabs)/profile.tsx`

### 14. Empty / loading / error states đúng
- Status: PASS with minor gaps
- Checked:
  - offer detail review section: loading/error/empty present
  - profile: overall loading/error present; rating section piggybacks on profile load
  - deal detail review form: inline validation error present

## Bugs Found

### Bug 1
- Title: `POST /reviews` did not enforce real auth and eligibility consistently
- Files:
  - `src/routes/reviews.ts`
  - `src/services/reviewService.ts`
- Impact:
  - guest could attempt review
  - unreleased deal rule was not properly enforced

### Bug 2
- Title: Mobile review list parsers expected wrong response shape
- File:
  - `mobile/src/services/reviewService.ts`
- Impact:
  - `getReviews`, `getReviewsByUserId`, `getReviewsByOfferId` could misread backend `{ items, total }`

### Bug 3
- Title: Deal detail had no actual review submission UI
- File:
  - `mobile/app/deals/[id].tsx`
- Impact:
  - submit review flow not QA-able in app

### Bug 4
- Title: Offer detail had no reviews section
- File:
  - `mobile/app/offers/[id].tsx`
- Impact:
  - offer review list + average rating not visible in app

### Bug 5
- Title: Profile did not render review aggregate
- File:
  - `mobile/app/(tabs)/profile.tsx`
- Impact:
  - average rating missing from profile UI

### Bug 6
- Title: Duplicate review could happen because rule was not enforced before
- File:
  - `src/services/reviewService.ts`

## Fixed Now

- Added strict auth requirement for review creation
- Wired review route to use `reviewService.createReview()` instead of raw push into mock array
- Fixed mobile review service list parsers to read `data.items`
- Added duplicate review protection (`dealId + reviewerId`)
- Added released-deal eligibility check before review creation
- Added participant restriction for released review submission in current mock rule set
- Added review form to deal detail screen
- Added review aggregate + review list section to offer detail screen
- Added review aggregate rating block to profile screen

## Still Open

- Released-deal eligibility still depends on a hardcoded released-deal participant map in `reviewService` instead of dynamic deal state source
- Review UI is only added in deal detail; there is still no standalone review create screen
- Profile rating block does not yet render review distribution/tags, only average + count
- Full mobile runtime interaction for the new review form was not executed because Expo/mobile runtime is not fully wired in this repo snapshot

## How to verify

### Backend

```bash
npm run typecheck
npm run build
node dist/server.js
```

### Create valid review

Generate token for `user_1`, then:

```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <USER_1_TOKEN>' \
  -d '{"dealId":"deal_4","subjectType":"user","subjectId":"user_4","reviewerRole":"client","rating":5,"comment":"Excellent delivery and communication throughout the project.","tags":["reliable","quality"]}'
```

### Duplicate review should fail

Run the same request again and expect:
- HTTP 409
- `CONFLICT_ERROR`

### Unreleased deal should fail

```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <USER_1_TOKEN>' \
  -d '{"dealId":"deal_1","subjectType":"user","subjectId":"user_1","reviewerRole":"client","rating":5,"comment":"Trying to review unreleased deal should fail.","tags":["blocked"]}'
```

### Aggregate

```bash
curl http://localhost:3000/api/v1/reviews/by-user/user_4
curl http://localhost:3000/api/v1/reviews/by-offer/offer_1
curl http://localhost:3000/api/v1/reviews/aggregate/user/user_4
curl http://localhost:3000/api/v1/reviews/aggregate/offer/offer_1
```

### Mobile code review targets

- `mobile/src/services/reviewService.ts`
- `mobile/src/components/RatingStars.tsx`
- `mobile/src/components/ReviewCard.tsx`
- `mobile/app/deals/[id].tsx`
- `mobile/app/offers/[id].tsx`
- `mobile/app/(tabs)/profile.tsx`
- `src/routes/reviews.ts`
- `src/services/reviewService.ts`
