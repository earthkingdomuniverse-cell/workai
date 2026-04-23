# Payments / Receipts / Transactions QA Checklist

Date: 2026-04-23

Scope:
- Payment screen
- Transactions history
- Receipts
- Transaction detail
- Pseudo-payment data consistency with deals flow

## Runtime Backend Checks

### 1. transaction history đúng
- Status: PASS
- Request:

```bash
curl http://localhost:3000/api/v1/transactions
```

- Result:
  - HTTP 200
  - shape: `data.items[]`, `data.total`
  - transaction types present: `fund`, `release`

### 2. transactions filter đúng
- Status: PASS
- Request:

```bash
curl 'http://localhost:3000/api/v1/transactions?dealId=deal_1&type=fund'
```

- Result:
  - HTTP 200
  - filtered down to fund transaction for `deal_1`

### 3. transaction detail đúng
- Status: PASS
- Request:

```bash
curl http://localhost:3000/api/v1/transactions/txn_1
```

- Result:
  - HTTP 200
  - transaction detail loads by id

### 4. deal receipts đúng
- Status: PASS
- Request:

```bash
curl http://localhost:3000/api/v1/deals/deal_1/receipts
```

- Result:
  - HTTP 200
  - receipt list returned for deal
  - includes `items`, `subtotal`, `serviceFee`, `total`, `paidAt`

### 5. receipt detail đúng
- Status: PASS
- Request:

```bash
curl http://localhost:3000/api/v1/receipts/rcpt_1
```

- Result:
  - HTTP 200
  - receipt detail loads by id

### 6. receipts list endpoint consistency
- Status: PASS
- Request:

```bash
curl 'http://localhost:3000/api/v1/receipts?dealId=deal_1'
```

- Result:
  - HTTP 200
  - route now exists
  - returns `data.items[]` and `data.total`

### 7. pseudo-payment consistency with deal flow
- Status: PASS after fix
- Runtime flow:
  - check transaction/receipt count for `deal_1`
  - fund `deal_1`
  - submit `deal_1`
  - release `deal_1`
  - re-check transaction/receipt count

- Result:
  - transactions for `deal_1` increased from 2 -> 4
  - receipts for `deal_1` increased from 1 -> 3
  - latest transaction types included new `fund` and `release`
  - latest receipt total = `12600`, aligned with `amount 12000 + serviceFee 600`

## Mobile Code-Path Checks

### 8. payment screen load đúng
- Status: PASS
- Verified in:
  - `mobile/app/deals/payment.tsx`
- Result:
  - screen reads `dealId`
  - now fetches deal summary through `dealService.getDeal()`
  - displays deal title/status when available
  - uses real `fundDeal()` service call

### 9. transaction history đúng
- Status: PASS
- Verified in:
  - `mobile/app/transactions/history.tsx`
  - `mobile/src/services/paymentService.ts`
- Result:
  - history screen now uses real service path
  - has loading/error/empty/refresh

### 10. receipts đúng
- Status: PASS
- Verified in:
  - `mobile/app/deals/receipts.tsx`
  - `mobile/src/components/ReceiptCard.tsx`
- Result:
  - receipts screen uses service path
  - has loading/error/empty/refresh
  - receipt card shows receipt number, total, date, items count, deal id

### 11. amount formatting đúng
- Status: PASS
- Verified in:
  - `mobile/src/components/TransactionCard.tsx`
  - `mobile/src/components/ReceiptCard.tsx`
  - `mobile/app/deals/payment.tsx`
  - `mobile/app/transactions/[id].tsx`
- Result:
  - uses `Intl.NumberFormat`
  - 2-decimal currency formatting on transaction/receipt/payment summary

### 12. date formatting đúng
- Status: PASS
- Verified in:
  - `mobile/src/components/TransactionCard.tsx`
  - `mobile/src/components/ReceiptCard.tsx`
  - `mobile/app/transactions/[id].tsx`
- Result:
  - date/time rendered from backend timestamps using locale date or locale datetime

### 13. type mapping đúng
- Status: PASS
- Verified in:
  - `mobile/src/components/TransactionCard.tsx`
- Mapped labels checked:
  - `fund` -> Funding
  - `release` -> Funds Released
  - `refund` -> Refund
  - `payout` -> Payout
  - `service_fee` -> Service Fee
  - `dispute_resolution` -> Dispute Resolution

### 14. deal payment summary đúng
- Status: PASS after fix
- Verified in:
  - `mobile/app/deals/payment.tsx`
- Result:
  - no longer depends only on query param amount
  - fetches actual deal summary and uses backend deal amount when needed

### 15. transaction detail nếu có không vỡ
- Status: PASS
- Verified in:
  - `mobile/app/transactions/[id].tsx`
  - `mobile/src/services/paymentService.ts`
- Result:
  - detail route now loads through service
  - shows id/type/status/amount/reference/date
  - has loading and error fallback behavior

## Bugs Found

### Bug 1
- Title: payments mobile service parsed backend response shape incorrectly
- Files:
  - `mobile/src/services/paymentService.ts`
- Root cause likely:
  - expected `response.data.data` while backend returned `data` directly or `data.items`

### Bug 2
- Title: transaction history screen used local hardcoded mock array instead of shared service
- File:
  - `mobile/app/transactions/history.tsx`

### Bug 3
- Title: transaction detail screen was placeholder only
- File:
  - `mobile/app/transactions/[id].tsx`

### Bug 4
- Title: `/receipts?dealId=...` route was missing but mobile service expected it
- File:
  - `src/routes/transactions.ts`

### Bug 5
- Title: transaction/receipt mock data for `deal_1` was inconsistent with deal amount
- Files:
  - `src/mocks/transactions.ts`
  - `src/routes/deals.ts`
- Impact:
  - `deal_1.amount = 12000`
  - old transaction/receipt data used `5000`

### Bug 6
- Title: deal fund/release flow did not generate transaction or receipt artifacts
- Files:
  - `src/routes/deals.ts`
- Impact:
  - payment history did not reflect actual fund/release actions

### Bug 7
- Title: TransactionCard had duplicate `formatAmount` function and ignored `onPress`
- File:
  - `mobile/src/components/TransactionCard.tsx`

### Bug 8
- Title: payment screen relied too much on route param amount, not actual deal summary
- File:
  - `mobile/app/deals/payment.tsx`

## Fixed Now

- Fixed mobile payment service response parsing
- Added backend `GET /receipts` list route
- Aligned `deal_1` mock transactions and receipt values with `deal.amount`
- Rewrote `TransactionCard` to remove duplicate formatter and honor `onPress`
- Rebuilt transaction history screen to use service with loading/error/empty/refresh
- Rebuilt transaction detail screen to load real transaction by id
- Improved receipts screen with proper loading/error/empty/refresh behavior
- Connected deal payment screen to real `fundDeal()` flow
- Added actual deal summary loading to payment screen
- Added transaction/receipt artifact creation during deal `fund` and `release` backend transitions

## Still Open

- Payment processor remains pseudo-payment; card details are UI-only and not sent to a real PSP
- No true receipt PDF flow yet
- Full device/simulator verification for mobile payment/receipt screens not executed because Expo/mobile runtime is not fully wired in this repo snapshot

## How to verify

### Backend

```bash
npm run typecheck
npm run build
node dist/server.js
```

### Transactions

```bash
curl http://localhost:3000/api/v1/transactions
curl 'http://localhost:3000/api/v1/transactions?dealId=deal_1&type=fund'
curl http://localhost:3000/api/v1/transactions/txn_1
```

### Receipts

```bash
curl http://localhost:3000/api/v1/deals/deal_1/receipts
curl http://localhost:3000/api/v1/receipts/rcpt_1
curl 'http://localhost:3000/api/v1/receipts?dealId=deal_1'
```

### Pseudo-payment consistency check

1. Generate tokens for deal participants
2. Fund deal_1
3. Submit deal_1
4. Release deal_1
5. Re-check `/transactions?dealId=deal_1` and `/deals/deal_1/receipts`

Expected:
- transaction count increases
- receipt count increases
- latest receipt total matches deal amount + service fee

### Mobile code review targets

- `mobile/src/services/paymentService.ts`
- `mobile/app/deals/payment.tsx`
- `mobile/app/deals/receipts.tsx`
- `mobile/app/transactions/history.tsx`
- `mobile/app/transactions/[id].tsx`
- `mobile/src/components/TransactionCard.tsx`
- `mobile/src/components/ReceiptCard.tsx`
