# Payment & Wallet QA Checklist

## Deposit
- [ ] ZaloPay callback triggers wallet.deposit
- [ ] Idempotency key prevents duplicate deposits
- [ ] Ledger entry created with correct before/after balances

## Hold (Escrow)
- [ ] Buy uses wallet.available
- [ ] Funds moved to held
- [ ] No double-spend under concurrent requests

## Release
- [ ] Funds moved from held → provider.available
- [ ] Platform fee recorded
- [ ] Ledger entries correct for provider and platform

## Withdraw
- [ ] Withdrawal reduces available balance
- [ ] Transaction created with status pending
- [ ] Reject triggers reverseWithdrawal
- [ ] Ledger records refund correctly

## Integrity
- [ ] Total system money remains consistent
- [ ] Ledger matches wallet balances
- [ ] No negative balances
