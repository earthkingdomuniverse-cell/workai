# WorkAI Monetization 1.0 Spec

## Purpose

Define what monetization exists at WorkAI 1.0 launch and what should be deferred.

## Launch revenue streams

None by default for 1.0.

## Rationale

- Liquidity comes before fees.
- Trust comes before monetization.
- Users should reach first value before monetization appears.
- Early operator learning matters more than revenue extraction.

## Post-launch reference model

### Option A: 5% platform fee

| Attribute | Detail |
| --- | --- |
| Fee | 5% of deal value |
| Who pays | Provider or split, to be tested |
| Charged when | Deal release |
| Display | Proposal, deal detail, payment summary, receipt |

### Option B: 10% platform fee

| Attribute | Detail |
| --- | --- |
| Fee | 10% of deal value |
| Who pays | Provider or split, to be tested |
| Charged when | Deal release |
| Display | Proposal, deal detail, payment summary, receipt |

## Edge cases

| Scenario | Handling |
| --- | --- |
| Deal cancelled | No fee |
| Dispute partial refund | Pro-rated fee logic |
| Full refund | Fee refunded or waived |
| Manual payout | Fee recorded as ledger entry |

## Launch decision

WorkAI 1.0 should launch free or with explicit pseudo-payment limitations until deal completion and trust loops are proven.

## Historical note

This document was moved from the repository root into `docs/monetization/` during the WorkAI documentation organization batch. The original detailed spec remains available in git history.
