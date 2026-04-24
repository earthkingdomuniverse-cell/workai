# WorkAI Support and Incident Operations

## Purpose

Practical support and incident operations guide for WorkAI launch and early operations.

## Support levels

### Level 1: AI support

- Automated support chat and FAQ-style responses.
- Handles common product questions and basic usage issues.
- Expected response: immediate.

### Level 2: In-app support

- Support form or message-based support.
- Handles complex questions not resolved by AI.
- Expected response: within one business day during early launch.

### Level 3: Human escalation

- Founder/operator/developer escalation.
- Handles critical issues, disputes, payment-related issues, account safety, fraud, and high-value user problems.
- Expected response: prioritized based on severity.

## Response priority model

| Priority | Definition | Target response | Example |
| --- | --- | --- | --- |
| P1 Critical | App down, data loss, security issue | Immediate | Crash on launch |
| P2 High | Major feature broken | Same day | Cannot create offer/deal |
| P3 Medium | Feature degraded | Within 24 hours | Slow AI response |
| P4 Low | Question or minor issue | Within 48 hours | How-to question |

## Dispute escalation

### Flow

1. User opens dispute.
2. AI/support triage attempts classification.
3. Operator reviews deal context.
4. Operator reviews messages/evidence/risk signals where available.
5. Operator records resolution.
6. Deal state updates accordingly.

### Resolution options

- Accept provider claim.
- Accept requester/client claim.
- Partial refund.
- Full refund.
- Hold funds pending review.
- Ban or restrict user if fraud is confirmed.

## Fraud escalation

### Sources

- Automated risk/fraud signals.
- User reports.
- Operator review.
- Unusual activity patterns.

### Actions

- Warning.
- Temporary restriction.
- Permanent restriction.
- Manual review requirement.
- External escalation if legally necessary.

## AI support versus human escalation

### AI support can handle

- Creating offers.
- Understanding trust score.
- Explaining matching.
- Explaining reviews.
- Basic navigation and feature guidance.

### Escalate to human when

- Payment or pseudo-payment issue.
- Dispute or fraud report.
- Harassment or safety issue.
- Account restriction issue.
- Repeated unresolved AI support loop.

## Incident severity

| Severity | Meaning |
| --- | --- |
| Sev 1 | App down, data loss, security breach |
| Sev 2 | Major feature unavailable for many users |
| Sev 3 | Feature degraded or small segment affected |
| Sev 4 | Cosmetic or minor issue |

## Communication principles

- Be direct and honest.
- Acknowledge the issue.
- Give the next update point when possible.
- Avoid blaming users.
- Record incident notes for postmortem.

## Rollback and pause conditions

Consider rollback or feature pause when:

- Sev 1 issue is not controlled quickly.
- Critical security issue is discovered.
- Core deal/payment workflow is unsafe.
- Data integrity is at risk.
- Complaint/error rate spikes unexpectedly.

## Support tools

- AI support surface.
- In-app support form or inbox.
- Admin/operator review screens.
- Manual issue tracker if no dedicated support platform exists yet.

## Historical note

This document was moved from repository root into `docs/launch/` during the WorkAI documentation organization batch. The original SkillValue AI support and incident ops spec remains available in git history.
