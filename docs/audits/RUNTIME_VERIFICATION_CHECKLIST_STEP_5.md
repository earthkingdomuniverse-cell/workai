# WorkAI Runtime Verification Checklist - Step 5

## Purpose

Define the exact runtime verification checklist after backend/mobile contract hardening.

This file is meant to be executed locally or in CI. It does not assume the app is production-ready until every section passes.

## What changed before this checklist

Recent hardening included:

- Mobile `apiClient` default export and safer response parsing.
- Mobile proposal/AI/deal services normalized to `{ data, meta }` response shape.
- Backend deals support `providerId=me` and `clientId=me`.
- Backend proposals resolve real Prisma offer/request records instead of mock records.
- Backend transactions/receipts read from Prisma instead of mocks.
- Backend reviews read/write from Prisma instead of mock reads.
- Backend trust profiles use Prisma user/review/deal/dispute data.
- Deal read endpoints are authenticated and participant/operator/admin scoped.
- Payment create/status endpoints are authenticated and scoped.
- Withdraw list endpoint now rejects guest users.

---

# Phase 1 - Backend install and static checks

## 1. Install dependencies

```bash
npm install
```

Expected:

- install completes without dependency resolution failure.

## 2. Prisma generate

```bash
npx prisma generate
```

Expected:

- Prisma client generated successfully.

## 3. TypeScript typecheck

```bash
npm run typecheck
```

Expected:

- no TypeScript errors.

Potential risk areas:

- Prisma relation filters introduced in `reviews.ts`.
- AuthContext role checks in `payments.ts`.
- Deal filter `OR` query in `deals.ts`.

## 4. Backend build

```bash
npm run build
```

Expected:

- TypeScript build succeeds.

---

# Phase 2 - Database readiness

## 1. Check database URL

```bash
echo $DATABASE_URL
```

Expected:

- points to local/staging PostgreSQL.
- never points to production while running tests.

## 2. Run migrations

```bash
npx prisma migrate deploy
```

or for local development:

```bash
npx prisma migrate dev
```

Expected:

- database schema includes:
  - User
  - Offer
  - WorkRequest
  - Proposal
  - Deal
  - Milestone
  - Transaction
  - Wallet
  - WalletLedgerEntry
  - Review
  - Dispute
  - PaymentAuditLog

## 3. Optional seed

Use seed only against local/staging.

```bash
npm run seed
```

Expected:

- seed completes without writing production credentials.

---

# Phase 3 - Backend start

## 1. Start backend

```bash
npm run dev
```

or:

```bash
npm run build
npm start
```

Expected:

- server starts.
- no Prisma connection error.
- health endpoint available.

## 2. Health check

```bash
curl http://localhost:3000/health
```

Expected:

- status ok / healthy response.

---

# Phase 4 - Auth smoke test

## 1. Signup

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"client-test@example.com","password":"ChangeMe123!","role":"member"}'
```

Expected:

- user created.
- response contains auth data/token depending current auth contract.

## 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"client-test@example.com","password":"ChangeMe123!"}'
```

Expected:

- access token returned.

Store token:

```bash
export CLIENT_TOKEN=<token>
```

## 3. Auth me

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- current user returned.

---

# Phase 5 - Marketplace smoke test

## 1. Create provider user

Create and login a second user:

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"provider-test@example.com","password":"ChangeMe123!","role":"member"}'
```

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"provider-test@example.com","password":"ChangeMe123!"}'
```

Store token:

```bash
export PROVIDER_TOKEN=<token>
```

## 2. Create offer as provider

```bash
curl -X POST http://localhost:3000/api/v1/offers \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"React dashboard build","description":"I will build a production-ready React dashboard for your business.","category":"Development","price":500,"currency":"USD","pricingType":"fixed"}'
```

Expected:

- offer created.
- response contains `id`.

Store:

```bash
export OFFER_ID=<offer_id>
```

## 3. Create request as client

```bash
curl -X POST http://localhost:3000/api/v1/requests \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Need React developer","description":"Need help building an internal admin dashboard with React and TypeScript.","category":"Development","skills":["React","TypeScript"],"budget":{"min":300,"max":800,"currency":"USD"},"urgency":"medium"}'
```

Expected:

- request created.
- response contains `id`.

Store:

```bash
export REQUEST_ID=<request_id>
```

---

# Phase 6 - Proposal smoke test

## 1. Provider sends proposal to request

```bash
curl -X POST http://localhost:3000/api/v1/proposals \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"requestId":"'"$REQUEST_ID"'","title":"React dashboard proposal","message":"I can deliver this dashboard with clean components, API integration, and responsive layout.","proposedAmount":600,"currency":"USD","estimatedDeliveryDays":14,"revisions":2}'
```

Expected:

- proposal created.
- backend resolves request from Prisma, not mocks.
- `clientId` should be request requester.
- `providerId` should be provider token user id.

Store:

```bash
export PROPOSAL_ID=<proposal_id>
```

## 2. Client accepts proposal

```bash
curl -X POST http://localhost:3000/api/v1/proposals/$PROPOSAL_ID/accept \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- proposal accepted.
- if product logic creates deal on accept, deal reference should exist.
- if not, deal must be created separately.

---

# Phase 7 - Deal smoke test

## 1. Create deal manually if needed

```bash
curl -X POST http://localhost:3000/api/v1/deals \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"requestId":"'"$REQUEST_ID"'","offerId":"'"$OFFER_ID"'","proposalId":"'"$PROPOSAL_ID"'","providerId":"<provider_user_id>","title":"React dashboard deal","description":"Deal for building the requested React dashboard.","amount":600,"currency":"USD"}'
```

Expected:

- deal created.
- response contains `id`.

Store:

```bash
export DEAL_ID=<deal_id>
```

## 2. Verify participant deal list

Client:

```bash
curl http://localhost:3000/api/v1/deals?clientId=me \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Provider:

```bash
curl http://localhost:3000/api/v1/deals?providerId=me \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

Expected:

- backend resolves `me` to token user id.
- each user sees only their own relevant deals.

## 3. Verify deal detail access control

Participant should pass:

```bash
curl http://localhost:3000/api/v1/deals/$DEAL_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Unauthenticated should fail:

```bash
curl http://localhost:3000/api/v1/deals/$DEAL_ID
```

Expected:

- participant receives deal.
- unauthenticated request receives 401.

---

# Phase 8 - Payment / wallet / transaction smoke test

## 1. Create ZaloPay payment

```bash
curl -X POST http://localhost:3000/api/v1/payments/zalopay/create \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"dealId":"'"$DEAL_ID"'","amount":600}'
```

Expected:

- request requires auth.
- backend ignores client-provided `userId`.
- only deal client can create payment.
- response contains providerRef/checkoutUrl.

Store:

```bash
export PROVIDER_REF=<provider_ref>
```

## 2. Payment status

```bash
curl "http://localhost:3000/api/v1/payments/status?provider=zalopay&providerRef=$PROVIDER_REF" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- deal client can view.
- unrelated member cannot view.

## 3. Transactions

```bash
curl http://localhost:3000/api/v1/transactions?dealId=$DEAL_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- returns Prisma transaction rows, not mock transaction rows.

## 4. Receipts

```bash
curl http://localhost:3000/api/v1/deals/$DEAL_ID/receipts \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- returns receipt views derived from transactions.

---

# Phase 9 - Reviews / trust smoke test

## 1. Review before release should fail

```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"dealId":"'"$DEAL_ID"'","subjectType":"user","subjectId":"<provider_user_id>","rating":5,"comment":"Great work and clear communication."}'
```

Expected:

- fails unless deal status is `released`.

## 2. Trust me

```bash
curl http://localhost:3000/api/v1/trust/me \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- returns Prisma-backed trust profile.
- no longer returns first mock trust profile.

## 3. Trust user

```bash
curl http://localhost:3000/api/v1/trust/<provider_user_id>
```

Expected:

- returns trust profile for provider user.

---

# Phase 10 - Withdraw smoke test

## 1. Unauthenticated withdraw list should fail

```bash
curl http://localhost:3000/api/v1/withdraw
```

Expected:

- 401 authentication required.

## 2. Authenticated withdraw list should pass

```bash
curl http://localhost:3000/api/v1/withdraw \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- returns user's withdrawal transactions only.

---

# Phase 11 - Mobile static checks

## 1. Install mobile dependencies

```bash
cd mobile
npm install
```

Expected:

- install completes.

## 2. Typecheck mobile

```bash
npx tsc --noEmit
```

Expected:

- no TypeScript errors.

Known recent fixes to verify:

- `apiClient` has default export.
- `admin/overview.tsx` no longer has duplicated JSX.
- proposal/AI/deal services parse `{ data, meta }` correctly.

## 3. Start Expo

```bash
npx expo start
```

Expected:

- Expo starts.
- no bundler error from services or admin overview.

---

# Phase 12 - Mobile runtime smoke test

## Screens to open

1. Login
2. Signup
3. Onboarding intro
4. Role select
5. Home
6. Explore
7. Offers
8. Requests
9. Proposals
10. Deals
11. AI
12. Inbox
13. Activity
14. Profile
15. Admin as member
16. Admin as operator/admin

## Expected results

- App boots.
- No red screen.
- Tabs render.
- Member cannot access admin.
- Operator/admin can access admin overview.
- Deals tab does not fail due to `providerId=me` or `clientId=me`.

## Known mobile gaps still expected

- Login/signup UI may still be placeholder.
- Notification service may fallback because backend notification routes do not exist yet.
- Admin overview does not yet use backend `/admin/overview` directly.

---

# Pass/fail criteria

## Minimum pass

- Backend typecheck passes.
- Backend build passes.
- Backend starts.
- Auth smoke test passes.
- Offer/request/proposal smoke test passes.
- Deal participant access control passes.
- Transactions/receipts return Prisma-backed records.
- Trust `/me` requires auth and returns real user profile.
- Mobile TypeScript compiles.
- Expo starts without syntax/import errors.

## Not considered pass yet

- Production launch.
- Payment processor full live settlement.
- Notification production readiness.
- Full App Store readiness.
- Security audit completion.

---

# Next engineering steps after this checklist

1. Implement real mobile login/signup UI.
2. Add backend notification routes or remove fake notification calls.
3. Add mobile adminService and call backend admin endpoints.
4. Add AI next-action endpoint and mobile next-action UI.
5. Add CI job to run backend/mobile typecheck automatically.
