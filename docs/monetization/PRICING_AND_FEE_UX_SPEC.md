# WorkAI Pricing and Fee UX Spec

## Purpose

Define how WorkAI should present pricing and fees without damaging trust or conversion.

## When users see fees

| Screen | Display | Notes |
| --- | --- | --- |
| Proposal | Amount only or estimated total | Avoid surprise later; show fee if commitment is near |
| Deal detail | Deal amount plus fee breakdown | Must be shown before funding/commitment |
| Payment screen | Final amount breakdown | Required before confirmation |
| Receipt | Amount, platform fee, total | Required after release/settlement |

## Transparency rules

1. Always show fees before commitment.
2. Always show breakdown on receipt.
3. Do not hide platform economics.
4. Do not change fee after funding unless dispute/refund logic requires it and user is informed.
5. Do not use pricing copy that makes trust feel pay-to-win.

## Suggested copy

Prefer:

- Service fee
- Platform contribution
- WorkAI platform fee
- Included in total

Avoid:

- Hidden fee
- Surprise fee
- Processing tax
- Charged without context

## UI placement

### Deal detail

```text
Deal amount: $A
Service fee: $B
Total: $C
```

### Receipt

```text
WorkAI receipt
Amount: $A
Service fee: $B
Total paid: $C
Reference: [id]
```

### Proposal acceptance

```text
Before you accept:
Proposal amount: $A
Estimated service fee: $B
Estimated total: $C
```

## Edge cases

| Case | UX handling |
| --- | --- |
| Cancelled deal | Show no fee or reversed fee |
| Full refund | Show fee refunded/waived |
| Partial refund | Show pro-rated breakdown |
| Dispute hold | Show funds/fees pending review |

## Historical note

This document was moved from the repository root into `docs/monetization/` during the WorkAI documentation organization batch. The original concise spec remains available in git history.
