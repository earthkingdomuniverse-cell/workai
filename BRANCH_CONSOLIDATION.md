# Branch Consolidation Decision

## Final Decision

The `main` branch is the single source of truth.

## Reason

- `main` contains the production-ready wallet, ledger, escrow, and payment system.
- Other branches (`main1`, `codex/product-runtime-foundation`) contain alternative schemas and legacy logic.
- Merging them directly would break financial integrity.

## What was kept

- QA system (adapted)
- Documentation concepts

## What was rejected

- Alternative Prisma schemas
- Legacy payment flows
- Incompatible mobile/backend assumptions

## Rule Going Forward

- All development must branch from `main`
- No schema rewrite without migration strategy
- No payment logic change without QA validation

## Archive Branches

These branches are considered archived:

- main1
- codex/product-runtime-foundation
- backup/main-before-workai-unify

They should not be merged.
