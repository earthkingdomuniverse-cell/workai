# WorkAI Retention Strategy 1.0

## Purpose

Retention strategy for WorkAI 1.0 focused on getting users back to complete value exchange loops.

## D1 retention

Goal: user returns after the first signup day.

### Tactics

- Push or in-app nudge: complete profile to get matched.
- AI next-action: add skills, create first offer, or post first request.
- Home banner: welcome and first-value action.

### Target

- D1 retention: 40%+

## D7 retention

Goal: user returns within the first week.

### Tactics

- Provider: notify about matching requests.
- Requester: notify about matching providers or proposals.
- Deal reminder: show in-progress deal actions.
- Optional digest: summarize new opportunities and unfinished flows.

### Target

- D7 retention: 20%+

## D30 retention

Goal: user returns after a month.

### Tactics

- Show trust score growth.
- Show reviews received.
- Highlight completed deals or new matched opportunities.
- Monthly digest if available.

### Target

- D30 retention: 10%+

## Reactivation

| User state | Signal | Recovery action |
| --- | --- | --- |
| Dormant | 14 days no login | New matched opportunities |
| Churn risk | 30 days no login | Profile activity or trust update |
| Churned | 60 days no login | Re-entry offer or curated opportunity |

## Incomplete deal recovery

| Trigger | Action |
| --- | --- |
| Deal pending too long | Remind relevant party to act |
| Revision requested | Prompt provider to address feedback |
| Submitted but not reviewed | Prompt client to review and release |

## Abandoned proposal recovery

| Trigger | Action |
| --- | --- |
| Proposal pending too long | Prompt requester to accept, reject, or ask follow-up |
| Provider sent no proposal | Prompt provider to browse matched requests |

## AI next-action retention map

| Context | Next action |
| --- | --- |
| No offer | Create first offer |
| No request | Create first request |
| No proposal | Browse requests or send proposal |
| Deal in progress | Submit work or review work |
| Deal completed | Leave review |
| Profile incomplete | Add skills or improve bio |

## Historical note

This document was moved from the repository root into `docs/product/` during the WorkAI documentation organization batch. The original detailed strategy remains available in git history.
