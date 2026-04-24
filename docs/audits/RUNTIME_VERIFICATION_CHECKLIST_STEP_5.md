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
- Mobile login/signup UI has been implemented.
- Public onboarding no longer allows users to self-select `operator` or `admin` roles.
- Mobile admin overview now calls backend `/admin/overview` through `adminService`.
- Backend admin routes now use normalized `{ data, meta }` response shape.
- Backend notification routes have been added and registered.
- Notification persistence has been added through Prisma `Notification` and `NotificationPreference` models.
- Notification creation hooks have been added for proposal, deal, payment release, dispute, and review events.
- Backend AI now includes `/ai/next-action`.
- Mobile Home and AI Next Action screens now call `aiService.nextAction()`.
- GitHub Actions CI has been added for backend and mobile static checks.

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
- Notification Prisma models and route calls in `notifications.ts`.
- Notification hook imports in proposal/deal/review flows.
- Admin response normalization.
- AI next-action response shape.

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

## 2. Create local notification migration

Because notification persistence changed Prisma schema, local dev should create/apply the migration:

```bash
npx prisma migrate dev --name add_notifications
```

Expected:

- migration includes `Notification` and `NotificationPreference` tables.
- Prisma client is regenerated.

## 3. Deploy migrations in CI/staging/production

```bash
npx prisma migrate deploy
npx prisma generate
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
  - Notification
  - NotificationPreference

## 4. Optional seed

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
- client receives `proposal_received` notification.

Store:

```bash
export PROPOSAL_ID=<proposal_id>
```

## 2. Verify proposal received notification for client

```bash
curl "http://localhost:3000/api/v1/notifications?type=proposal_received" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- at least one notification references `$PROPOSAL_ID` in `data.proposalId`.

## 3. Client accepts proposal

```bash
curl -X POST http://localhost:3000/api/v1/proposals/$PROPOSAL_ID/accept \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- proposal accepted.
- provider receives `proposal_accepted` notification.
- if product logic creates deal on accept, deal reference should exist.
- if not, deal must be created separately.

## 4. Verify proposal accepted notification for provider

```bash
curl "http://localhost:3000/api/v1/notifications?type=proposal_accepted" \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

Expected:

- at least one notification references `$PROPOSAL_ID` in `data.proposalId`.

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
- provider receives `deal_update` notification for new deal.

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

## 4. Verify deal notification for provider

```bash
curl "http://localhost:3000/api/v1/notifications?type=deal_update" \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

Expected:

- at least one notification references `$DEAL_ID` in `data.dealId`.

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

## 5. Fund/submit/release notification events

After funding/submitting/releasing a deal through their respective endpoints, verify:

```bash
curl "http://localhost:3000/api/v1/notifications?type=deal_update" \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

Expected:

- provider receives `deal_update` notifications for funded/released events.
- client receives `deal_update` notification for submitted work.

```bash
curl "http://localhost:3000/api/v1/notifications?type=payment_received" \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

Expected:

- provider receives `payment_received` notification after release.

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

## 2. Review after release should create notification

After deal release succeeds, submit the review again.

Expected:

- review is created.
- reviewed user receives `review_received` notification.

```bash
curl "http://localhost:3000/api/v1/notifications?type=review_received" \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

Expected:

- at least one notification references `$DEAL_ID` in `data.dealId`.

## 3. Trust me

```bash
curl http://localhost:3000/api/v1/trust/me \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- returns Prisma-backed trust profile.
- no longer returns first mock trust profile.

## 4. Trust user

```bash
curl http://localhost:3000/api/v1/trust/<provider_user_id>
```

Expected:

- returns trust profile for provider user.

---

# Phase 10 - Notifications smoke test

## 1. Unauthenticated notification list should fail

```bash
curl http://localhost:3000/api/v1/notifications
```

Expected:

- 401 authentication required.

## 2. Authenticated notification list should seed and return persistent rows

```bash
curl http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- returns `{ data: { items, total, unreadCount } }`.
- if user has no notifications yet, backend seeds default persistent notifications.
- rows are stored in Prisma `Notification`.
- event notifications from proposal/deal/review hooks are visible to their recipients only.

## 3. Unread count

```bash
curl http://localhost:3000/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- returns `{ data: { count } }`.

## 4. Preferences

```bash
curl http://localhost:3000/api/v1/notifications/preferences \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Expected:

- returns persisted or default preferences.
- row exists in Prisma `NotificationPreference` after first call.

## 5. Update preferences

```bash
curl -X PATCH http://localhost:3000/api/v1/notifications/preferences \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"push":false,"types":{"system":true,"deals":true}}'
```

Expected:

- updates persisted preferences for current user only.

---

# Phase 11 - AI smoke test

## 1. AI next action

```bash
curl -X POST http://localhost:3000/api/v1/ai/next-action \
  -H 'Content-Type: application/json' \
  -d '{"context":{"role":"member","onboardingCompleted":true,"offersCount":0,"requestsCount":1,"dealsCount":0,"proposalsCount":0}}'
```

Expected:

- returns `{ data: { actions, summary } }`.

---

# Phase 12 - Withdraw smoke test

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

# Phase 13 - Mobile static checks

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
- login/signup screens compile.
- onboarding does not mutate system role.
- admin overview imports and uses `adminService`.
- Home imports and uses `aiService.nextAction()`.
- AI Next Action screen imports and uses `aiService.nextAction()`.

## 3. Start Expo

```bash
npx expo start
```

Expected:

- Expo starts.
- no bundler error from services or admin overview.

---

# Phase 14 - Mobile runtime smoke test

## Screens to open

1. Login
2. Signup
3. Onboarding intro
4. Role select
5. Profile setup
6. Skills setup
7. Goals setup
8. Home
9. Explore
10. Offers
11. Requests
12. Proposals
13. Deals
14. AI
15. AI Match
16. AI Price
17. AI Support
18. AI Next Action
19. Inbox
20. Activity
21. Profile
22. Admin as member
23. Admin as operator/admin

## Expected results

- App boots.
- No red screen.
- Login/signup forms render.
- Public onboarding does not offer operator/admin role selection.
- Home renders AI next action card.
- AI Next Action screen renders backend-generated actions.
- Notification inbox does not 404 after backend migration.
- Proposal/deal/review event notifications show in notification UI for the correct user.
- Tabs render.
- Member cannot access admin.
- Operator/admin can access admin overview.
- Deals tab does not fail due to `providerId=me` or `clientId=me`.

---

# Pass/fail criteria

## Minimum pass

- Backend typecheck passes.
- Backend build passes.
- Prisma migration for notifications has been applied.
- Backend starts.
- Auth smoke test passes.
- Offer/request/proposal smoke test passes.
- Deal participant access control passes.
- Transactions/receipts return Prisma-backed records.
- Trust `/me` requires auth and returns real user profile.
- Notifications require auth and return Prisma-backed rows.
- Proposal/deal/review events create notifications for the correct recipient.
- AI next-action returns `{ actions, summary }`.
- Mobile TypeScript compiles.
- Expo starts without syntax/import errors.

## Not considered pass yet

- Production launch.
- Payment processor full live settlement.
- Full App Store readiness.
- Security audit completion.

---

# Next engineering steps after this checklist

1. Run CI and patch any backend/mobile typecheck failures.
2. Create/apply notification migration in real environments.
3. Add full admin dispute/risk/fraud/review mobile screens using `adminService`.
4. Add CI database migration validation.
5. Add push/email delivery adapters behind the persisted notification system.
