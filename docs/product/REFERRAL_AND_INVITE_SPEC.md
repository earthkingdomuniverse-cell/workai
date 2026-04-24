# WorkAI Referral and Invite Spec

## Purpose

Define referral and invite flows for WorkAI 1.0 and later phases.

## Referral model

| Scenario | Inviter | Invitee | Reward timing |
| --- | --- | --- | --- |
| Provider invites provider | Provider | New provider | After real activation or first deal |
| Provider invites requester | Provider | New requester | After request/proposal/deal activity |
| Requester invites requester | Requester | New requester | After first valid request |
| Requester invites provider | Requester | New provider | After first valid offer/proposal |

## Launch reward model

For WorkAI 1.0, avoid heavy monetary rewards.

Recommended launch rewards:

- Referral badge.
- Profile recognition.
- Internal leaderboard for early cohort.
- Future credit only after monetization is ready.

## Anti-abuse principles

| Principle | Implementation |
| --- | --- |
| No self-referral | Device, email, and account checks |
| No fake accounts | Email verification and risk review |
| No invite spam | Rate limit invites |
| No reward farming | Reward only after real marketplace activity |
| Manual review | Flag suspicious referral patterns |

## User flows

### Invite friend

User opens invite -> enters email or shares link -> invite is tracked -> signup attribution is recorded.

### Invite collaborator

User opens invite from a deal/request context -> invite includes relevant context -> invitee lands in a guided onboarding flow.

### Invite provider to request

Requester invites a provider to view or respond to a request.

### Invite requester to platform

Provider invites a potential client to view an offer or post a request.

## Fraud signals

| Signal | Action |
| --- | --- |
| Same email invited repeatedly | Block or rate limit |
| Excessive invites from one user | Flag for review |
| Disposable email domain | Flag or block |
| Self-referral detected | Invalidate reward |
| High referral volume with no activation | Reduce invite trust |

## Historical note

This document was moved from the repository root into `docs/product/` during the WorkAI documentation organization batch. The original SkillValue AI referral spec remains available in git history.
