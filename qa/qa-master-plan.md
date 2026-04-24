# WorkAI QA Master Plan

## Source

Consolidated from the historical `codex/product-runtime-foundation` QA plan and adapted to the current `main` architecture.

## Scope

WorkAI QA focuses on the production-critical money and marketplace system:

- Backend API
- Wallet and ledger
- Payment gateway callbacks
- Escrow hold/release
- Platform fees
- Withdrawals and reversal safety
- Mobile app wallet/payment flows
- Deployment and DNS-based production setup

## Quality Gates

1. Unit tests pass
2. Integration tests pass
3. Money-flow tests pass
4. Security scan has no critical/high issue
5. Payment callback idempotency verified
6. Wallet ledger matches wallet balances
7. Deployment health check passes
8. Manual QA sign-off for release

## Critical Test Paths

### Money In

- Gateway creates pending deposit transaction
- Callback verifies signature
- Callback is idempotent
- Wallet available balance increases once
- Ledger records before/after balance

### Marketplace Purchase

- User buys offer using wallet balance
- Insufficient balance returns `WALLET_TOPUP_REQUIRED`
- Sufficient balance moves available to held
- Deal becomes funded

### Release

- Client releases deal
- Client held balance decreases
- Provider available balance increases
- Platform wallet receives fee
- Ledger entries are created for provider and platform

### Withdraw

- User creates withdrawal request
- Available balance decreases
- Pending withdrawal transaction is created
- Failed withdrawal reverses funds into wallet
- Ledger records refund/reversal

## Production Release Checklist

- [ ] `docker compose up -d --build` works locally
- [ ] `/health` returns success
- [ ] Prisma migrate deploy succeeds
- [ ] Wallet deposit test passes
- [ ] Wallet hold test passes
- [ ] Release and fee test passes
- [ ] Withdraw fail/reversal test passes
- [ ] ZaloPay callback test passes
- [ ] MoMo callback test passes if enabled
- [ ] Mobile deep link returns to WorkAI scheme
- [ ] Caddy serves HTTPS in production

## Do Not Merge Without Review

The old branches contain alternative Prisma schemas and legacy payment routes. They must not replace the current `main` financial core without manual review.
