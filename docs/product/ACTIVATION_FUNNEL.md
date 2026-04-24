# WorkAI Activation Funnel

## Purpose

Official activation funnel for measuring how users move from first open to first successful value exchange.

## Funnel overview

| Stage | Step | Success condition | Drop-off risk |
| --- | --- | --- | --- |
| 1 | Install / open | User opens app | Low |
| 2 | Signup | User creates account and session | Medium |
| 3 | Onboarding complete | Role, skills, goals completed | High |
| 4 | Profile quality threshold | Profile has enough data to match | Medium |
| 5 | First offer or request | First listing created | High |
| 6 | First proposal | Proposal sent or received | Medium |
| 7 | First funded deal | Deal reaches funded state | High |
| 8 | First released deal | Deal completes and releases | High |
| 9 | First review | Review submitted | Medium |

## AI intervention points

- Skill suggestions during onboarding
- AI price guidance during offer creation
- AI match from request detail and home recommendations
- Trust context before funding
- Next best action after each incomplete stage
- Review prompt after released deal

## Stage metrics

| Stage | Event | Target |
| --- | --- | --- |
| Signup | `signup_success` | 40% of opens |
| Onboarding | `onboarding_completed` | 70% of signups |
| Profile quality | `profile_quality_ready` | 80% of onboarded users |
| First listing | `offer_created` or `request_created` | 50% providers / 30% requesters |
| First proposal | `proposal_sent` or `proposal_received` | 30% of users with listing |
| Funded deal | `deal_funded` | 40% of accepted proposal flow |
| Released deal | `deal_released` | 60% of funded deals |
| First review | `review_created` | 50% of released deals |

## Recovery matrix

| Stage | Signal | Recovery action |
| --- | --- | --- |
| Signup | Signup fail | Login/signup recovery copy |
| Onboarding | Drop-off | Resume onboarding and profile completion nudge |
| Profile | Low profile quality | Home banner to add skills/bio |
| First listing | No listing after 48h | AI next-action and template prompt |
| Proposal | No proposal | AI match and browse suggestion |
| Funding | Accepted but unfunded | Reminder to client and trust reinforcement |
| Release | Submitted but not released | Review/approve reminder |
| Review | No review after 48h | Review reminder tied to trust score |

## Priority bottlenecks

1. First listing
2. First funded deal
3. First released deal
4. First review

## Historical note

This document was moved from the repository root into `docs/product/` during the WorkAI documentation organization batch. The original detailed activation funnel remains available in git history.
