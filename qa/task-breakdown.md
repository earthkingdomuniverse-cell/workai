# QA Task Breakdown (Consolidated)

This is a simplified and production-focused version of the original codex QA breakdown.

## Phase 1: Core Money System Tests

- [ ] Deposit idempotency test
- [ ] Wallet available/held consistency
- [ ] Ledger accuracy test
- [ ] Double-spend prevention test

## Phase 2: Marketplace Flow

- [ ] Buy with sufficient funds
- [ ] Buy with insufficient funds
- [ ] Hold → Release flow
- [ ] Platform fee calculation

## Phase 3: Withdrawal

- [ ] Create withdrawal
- [ ] Simulate failure → refund
- [ ] Ledger reconciliation

## Phase 4: Payment Gateway

- [ ] ZaloPay callback signature validation
- [ ] ZaloPay idempotent callback
- [ ] MoMo callback (if enabled)

## Phase 5: Deployment

- [ ] Local Docker works
- [ ] Production domain works via Caddy
- [ ] HTTPS auto provisioning works

## Rule

Do NOT implement test systems that require replacing current schema or wallet logic.

All tests must align with `main` architecture.
