# WorkAI Backend Endpoint Audit - Step 2

## Purpose

Endpoint-by-endpoint backend audit for the main WorkAI 1.0 backend routes.

This audit checks implementation shape from source files. It is not a runtime test. Every `DONE` or `PARTIAL` item still needs API smoke testing.

## Files inspected

- `src/routes/offers.ts`
- `src/routes/requests.ts`
- `src/routes/proposals.ts`
- `src/modules/proposal/routes.ts`
- `src/routes/deals.ts`
- `src/routes/payments.ts`
- `src/routes/wallet.ts`
- `src/routes/withdraw.ts`
- `src/routes/trust.ts`
- `src/routes/reviews.ts`
- `src/routes/recommendations.ts`
- `src/routes/transactions.ts`

## Status legend

- `DONE` - route exists and has meaningful implementation.
- `PARTIAL` - route exists but uses mock data, placeholder inputs, or has contract risk.
- `MISSING` - expected route not found.
- `NEEDS_RUNTIME_TEST` - route exists but behavior must be verified through API calls.

---

# 1. Offers endpoints

File: `src/routes/offers.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/offers` | No | `DONE` | List/search/filter offers from Prisma. |
| GET | `/offers/mine` | Yes | `DONE` | Authenticated provider's offers. |
| GET | `/offers/:id` | No | `DONE` | Offer detail by id. |
| POST | `/offers` | Yes | `DONE` | Create offer with title/description/price validation. |
| PATCH | `/offers/:id` | Yes owner-only | `DONE` | Edit own offer. |
| POST | `/offers/:id/buy` | Yes | `PARTIAL` | Creates funded deal and holds wallet funds. Requires wallet balance. |

## Important implementation details

- Uses Prisma `offer` table.
- `serializeOffer()` currently sets `skills: []` and `deliveryTime: undefined`, even if clients may expect these fields.
- Default currency is `VND` on create.
- Buy flow checks active offer, prevents provider buying own offer, checks wallet, creates a `funded` deal, service fee `5%`, then calls `walletService.holdForDeal`.

## Risks / gaps

1. `skills` are erased in response by `serializeOffer()`.
2. `deliveryTime` is erased in response.
3. No DELETE/archive endpoint found for offers.
4. Buy flow may bypass proposal flow and create a funded deal directly.
5. Need verify wallet and deal creation transaction consistency if wallet hold fails after deal create.

## Verdict

Status: `PARTIAL`

The core offer CRUD exists, but response shape and buy-flow consistency need contract verification.

---

# 2. Requests endpoints

File: `src/routes/requests.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/requests` | No | `DONE` | List/search/filter requests from Prisma. |
| GET | `/requests/mine` | Yes | `DONE` | Authenticated requester's requests. |
| GET | `/requests/:id` | No | `DONE` | Request detail. |
| POST | `/requests` | Yes | `DONE` | Create request. |
| PATCH | `/requests/:id` | Yes owner-only | `DONE` | Edit own request. |
| DELETE | `/requests/:id` | Yes owner-only | `DONE` | Delete own request. |

## Important implementation details

- Uses Prisma `workRequest` table.
- Validates title, description, and budget min/max.
- Serializes `budgetMin`, `budgetMax`, `currency` into nested `budget` object.
- Supports filters: `q`, `urgency`, `category`, `status`.

## Risks / gaps

1. Hard delete may not be ideal for production if proposals/deals depend on request history.
2. No explicit close endpoint, but `PATCH status` can likely close.
3. Need verify mobile expects `budget.min/max` and not `budgetMin/budgetMax`.

## Verdict

Status: `DONE / NEEDS_RUNTIME_TEST`

Requests are one of the more complete backend areas.

---

# 3. Proposals endpoints

Files:

- `src/routes/proposals.ts`
- `src/modules/proposal/routes.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/proposals` | No | `PARTIAL` | List/filter proposals via proposalService. |
| GET | `/proposals/mine` | Yes | `DONE` | My proposals. |
| GET | `/proposals/:id` | No | `PARTIAL` | Proposal detail. |
| POST | `/proposals` | Yes | `PARTIAL` | Create proposal. |
| POST | `/proposals/:id/accept` | Yes | `PARTIAL` | Accept proposal. |
| POST | `/proposals/:id/reject` | Yes | `PARTIAL` | Reject proposal. |
| POST | `/proposals/:id/withdraw` | Yes | `PARTIAL` | Withdraw proposal. |
| PATCH | `/proposals/:id` | Yes | `PARTIAL` | Update proposal. |
| DELETE | `/proposals/:id` | Yes | `PARTIAL` | Delete proposal. |

## Important implementation details

- Route file delegates to `src/modules/proposal/routes.ts` under `/proposals` prefix.
- Uses Zod schemas.
- Create proposal requires `title`, `message`, `proposedAmount`, `estimatedDeliveryDays`.
- Counterparty resolution uses `getRequestById()` from `../../mocks/requests` and `getOfferById()` from `../../mocks/offers`.

## Major contract risk

Offers and requests routes now use Prisma, but proposal creation resolves target offer/request through mock helpers. This can break proposals created against real Prisma offers/requests.

## Risks / gaps

1. Mock/Prisma drift: proposal counterparty resolution may fail for real database records.
2. Accept/reject/withdraw ownership rules need service-level inspection.
3. Public `GET /proposals` and `GET /proposals/:id` may expose too much depending on intended privacy model.
4. Need verify accept creates deal or only updates status.

## Verdict

Status: `PARTIAL`

Proposal routes exist, but the mock dependency makes this a critical backend alignment task.

---

# 4. Deals endpoints

File: `src/routes/deals.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/deals` | No | `PARTIAL` | Lists deals from Prisma; no auth filter by default. |
| POST | `/deals` | Yes | `DONE` | Creates deal with amount, provider/client, milestones. |
| GET | `/deals/:id` | No | `PARTIAL` | Deal detail; no participant/auth guard. |
| POST | `/deals/:id/fund` | Yes client-only | `DONE` | Created -> funded. |
| POST | `/deals/:id/submit` | Yes provider-only | `DONE` | Funded -> submitted. |
| POST | `/deals/:id/release` | Yes client-only | `DONE` | Submitted/funded -> released and wallet release. |
| POST | `/deals/:id/dispute` | Yes participant-only | `DONE` | Funded/submitted/released -> disputed. |

## Important implementation details

- Uses Prisma `deal` with milestones, transactions, disputes, reviews included.
- Defines state transitions:
  - created -> funded
  - funded -> submitted
  - submitted/funded -> released
  - funded/submitted/released -> disputed
- Creates ledger transaction in fund/release flows.
- Uses walletService for release.

## Risks / gaps

1. `GET /deals` is public and can filter by provider/client; may leak deal data.
2. `GET /deals/:id` is public; likely should require participant or operator/admin.
3. `POST /deals` allows user to pass providerId/clientId; needs stronger role/ownership validation.
4. Fund route records manual provider transaction but does not call wallet hold; offer buy flow does hold.
5. Release route allows release from `funded` without submit.
6. Need verify service fee accounting with partial releases.

## Verdict

Status: `PARTIAL`

The deal lifecycle exists and is meaningful, but access control and consistency between funding paths need hardening.

---

# 5. Payments endpoints

File: `src/routes/payments.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/payments/status` | No | `PARTIAL` | Looks up transaction by provider/providerRef. |
| POST | `/payments/zalopay/create` | No | `PARTIAL` | Creates ZaloPay wallet top-up for deal/client. |
| POST | `/payments/zalopay/callback` | Provider callback | `DONE` | Verifies ZaloPay MAC and deposits into wallet. |

## Important implementation details

- Has ZaloPay integration service abstraction through `getPaymentProvider('zalopay')`.
- Callback verifies MAC with `ZALOPAY_KEY2`.
- Writes `paymentAuditLog` records.
- Callback deposits into wallet using `walletService.deposit`.
- Handles duplicate completed callback idempotency.

## Risks / gaps

1. Create/status endpoints are unauthenticated and rely on body `userId` for create; this is risky.
2. No MoMo route despite some earlier nextAction mentioning momo in offer buy flow.
3. Payment create is for wallet top-up, not direct deal funding.
4. Need verify callback public exposure and replay handling.
5. Need verify payment provider env handling and dev/mock behavior.

## Verdict

Status: `PARTIAL`

ZaloPay callback/top-up foundation exists, but API security and full payment-product integration need hardening.

---

# 6. Wallet endpoints

File: `src/routes/wallet.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/wallet` | Yes | `DONE` | Current user wallet summary. |
| GET | `/wallet/ledger` | Yes | `DONE` | Current user wallet ledger. |

## Important implementation details

- Uses `walletService.getWallet(user.userId)`.
- Returns available, held, lifetimeIn, lifetimeOut, ledger.

## Risks / gaps

1. Needs runtime test with authenticated users and users without existing wallets.
2. Need verify precision/rounding strategy for money.

## Verdict

Status: `DONE / NEEDS_RUNTIME_TEST`

Wallet read endpoints are clear and properly authenticated.

---

# 7. Withdraw endpoints

File: `src/routes/withdraw.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| POST | `/withdraw` | Yes | `PARTIAL` | Creates pending withdrawal, debits wallet. |
| GET | `/withdraw` | Weak/unclear | `PARTIAL` | Lists user withdrawal transactions. |

## Important implementation details

- POST checks auth, amount, available balance.
- POST debits wallet immediately and creates pending transaction.
- GET calls `authenticate` but does not explicitly block guest user.

## Risks / gaps

1. GET `/withdraw` should explicitly reject guest user like POST.
2. Withdraw debits wallet immediately while status is pending; needs operational policy and reversal path.
3. No provider payout integration.
4. No admin approve/reject withdrawal flow found in this route.
5. Idempotency key uses timestamp; not client-provided idempotency.

## Verdict

Status: `PARTIAL`

Useful withdrawal scaffold exists, but production payout handling is incomplete.

---

# 8. Trust endpoints

File: `src/routes/trust.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/trust/me` | No | `PARTIAL` | Returns first mock trust profile. |
| GET | `/trust/:userId` | No | `PARTIAL` | Looks up mock profile by userId. |
| GET | `/trust` | No | `PARTIAL` | Lists mock trust profiles. |

## Important implementation details

- Uses `mockTrustProfiles` only.
- `/trust/me` does not authenticate and just returns first mock profile.

## Risks / gaps

1. Trust is not connected to real user/deal/review data.
2. `/trust/me` should authenticate.
3. Trust score is not recomputed from Prisma reviews/deals/disputes.
4. Public full trust list may not be intended.

## Verdict

Status: `PARTIAL / MOCK-ONLY`

Trust is a product-facing placeholder and needs real implementation.

---

# 9. Reviews endpoints

File: `src/routes/reviews.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/reviews` | No | `PARTIAL` | Lists mock reviews with filters. |
| GET | `/reviews/aggregate/:subjectType/:subjectId` | No | `PARTIAL` | Aggregates mock reviews. |
| GET | `/reviews/by-user/:id` | No | `PARTIAL` | Mock reviews by user. |
| GET | `/reviews/by-offer/:id` | No | `PARTIAL` | Mock reviews by offer. |
| POST | `/reviews` | Yes | `PARTIAL` | Creates review through `reviewService`. |

## Important implementation details

- Read endpoints use `mockReviews`.
- Create endpoint uses `reviewService.createReview()`.
- Requires `dealId`, `subjectType`, `subjectId`.

## Risks / gaps

1. Read/write source mismatch: reads are mock, writes may persist elsewhere through service.
2. Aggregate is based on mock reviews, not newly created reviews unless service also updates mock state.
3. Need verify duplicate review prevention and deal eligibility.
4. Need verify role: provider/client review permissions.

## Verdict

Status: `PARTIAL / HYBRID-MOCK`

Review routes exist but need unified persistence and eligibility rules.

---

# 10. Recommendations endpoints

File: `src/routes/recommendations.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/recommendations/home` | No | `PARTIAL` | Returns home recommendations with placeholder profile/skills/interests. |
| GET | `/recommendations/explore` | No | `PARTIAL` | Returns explore recommendations with placeholder profile/skills/interests. |

## Important implementation details

- Accepts `userId` query param or defaults to `anonymous`.
- Passes empty `profile`, `skills`, and `interests` into recommendation service.

## Risks / gaps

1. No authenticated user context.
2. No real profile/skills/interests hydration.
3. Recommendation quality will be limited unless service uses other data internally.
4. Needs mobile contract check.

## Verdict

Status: `PARTIAL`

Recommendation endpoint surface exists but data context is placeholder.

---

# 11. Transactions / receipts endpoints

File: `src/routes/transactions.ts`

## Endpoints found

| Method | Endpoint | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| GET | `/transactions` | No | `PARTIAL` | Lists mock transactions. |
| GET | `/transactions/:id` | No | `PARTIAL` | Gets mock transaction. |
| GET | `/receipts` | No | `PARTIAL` | Lists mock receipts. |
| GET | `/deals/:id/receipts` | No | `PARTIAL` | Mock receipts for deal. |
| GET | `/receipts/:id` | No | `PARTIAL` | Gets mock receipt. |

## Important implementation details

- Uses `mockTransactions` and `mockReceipts`.
- Deals/payments create real Prisma transactions, but this route reads mock transactions only.

## Major contract risk

Transaction/receipt reads do not reflect Prisma deal/payment/wallet activity.

## Risks / gaps

1. Users may fund/release deals and not see real transaction history through `/transactions`.
2. Receipts are not connected to real wallet/deal/payment data.
3. Endpoints are unauthenticated and filter by userId query.
4. Contract drift with `wallet/ledger` and `deals.transactions`.

## Verdict

Status: `PARTIAL / MOCK-ONLY`

This is one of the most important backend consistency gaps.

---

# Cross-route consistency findings

## Strong areas

1. Requests CRUD is comparatively complete.
2. Offers CRUD exists, plus a direct buy flow.
3. Deals have meaningful lifecycle transitions.
4. Wallet read endpoints are authenticated.
5. Payment callback has MAC verification and audit log.
6. Admin endpoints were already found in Step 1 and are guarded.

## Major backend risks

1. Proposal routes still resolve offers/requests from mock helpers while offer/request routes use Prisma.
2. Transactions and receipts are mock-only while deals/payments/wallet create real Prisma transactions and ledger entries.
3. Trust is mock-only and not connected to deal/review/dispute history.
4. Review reads are mock-based while review create uses a service.
5. Deal list/detail endpoints are public and may expose sensitive data.
6. Payment create/status endpoints are unauthenticated and use body/query identity.
7. Withdraw GET does not explicitly reject guest user.
8. Recommendation endpoints use placeholder profile/skills/interests.
9. AI next-action endpoint is still missing from the checked AI route.

---

# Priority fixes from Step 2

## P0 - Data source unification

1. Make proposals resolve Prisma `workRequest` and `offer` records instead of mock helpers.
2. Make transactions/receipts read from Prisma transaction/payment/wallet data.
3. Make reviews read from the same persisted source used by review creation.
4. Make trust compute from real user/deal/review/dispute data.

## P1 - Access control hardening

1. Protect `GET /deals` and `GET /deals/:id` by participant/operator/admin.
2. Protect payment create/status endpoints.
3. Require authenticated user context for recommendation endpoints when user-specific.
4. Explicitly reject guest user in `GET /withdraw`.

## P1 - Contract alignment

1. Do not erase offer `skills` and `deliveryTime` if mobile expects them.
2. Normalize currency defaults across offers/deals/requests.
3. Verify proposal amount field names: `price` vs `proposedAmount`.
4. Verify deal amount, fundedAmount, releasedAmount, serviceFee mapping.

## P2 - Product completeness

1. Add AI next-action endpoint.
2. Add offer archive/delete if intended.
3. Add withdrawal approval/reversal/admin operation.
4. Add real recommendation profile hydration.

---

# Step 2 verdict

Backend has a real and broad route surface, including marketplace, deals, wallet, payments, admin, AI, and recommendations.

However, it is not yet fully production-consistent because several important surfaces are split between Prisma-backed data and mock data. The next engineering milestone should focus less on adding new endpoints and more on unifying data sources, securing sensitive routes, and aligning mobile/backend contracts.
