# WorkAI Notification Strategy

## Purpose

Define notification strategy for WorkAI activation, transaction progress, retention, and operator workflows.

## Notification categories

### Activation notifications

| Trigger | Intent | User value | Priority |
| --- | --- | --- | --- |
| Onboarding completed | Complete profile to get matched | Faster discovery | High |
| Profile incomplete | Add skills to improve matching | Better recommendations | Medium |
| No first offer/request | Prompt first marketplace action | First value | High |

### Transaction notifications

| Trigger | Intent | User value | Priority |
| --- | --- | --- | --- |
| Proposal received | New proposal for your request | Review options | High |
| Proposal accepted | Your proposal was accepted | Start deal | High |
| Deal funded | Deal funded and ready | Start work | High |
| Work submitted | Work submitted for review | Review and release | High |
| Deal released | Deal completed | Close loop / review | High |

### Proposal notifications

| Trigger | Intent | Priority |
| --- | --- | --- |
| Proposal sent | Confirmation | Low |
| Proposal viewed | Engagement signal | Low |
| Proposal expiring | Action reminder | Medium |

### Deal milestone notifications

| Trigger | Intent | Priority |
| --- | --- | --- |
| Funding reminder | Fund deal to start | High |
| Submission reminder | Submit work | Medium |
| Review reminder | Review submitted work | Medium |
| Dispute opened | Resolve issue | High |

### Review notifications

| Trigger | Intent | Priority |
| --- | --- | --- |
| Review received | Trust feedback | Medium |
| Review reminder | Build reputation | Low |

### Risk/operator notifications

| Trigger | Intent | Priority |
| --- | --- | --- |
| Dispute created | Operator action needed | High |
| Risk signal | Review suspicious behavior | High |
| Fraud signal | Urgent review | Critical |

### Retention nudges

| Trigger | Intent | Priority |
| --- | --- | --- |
| No login for 7 days | Re-engage | Low |
| Offer but no proposals | Show matching requests | Medium |
| Request but no proposals | Show matching providers | Medium |
| Deal stalled | Prompt next action | High |

## Channel placement

| Type | In-app | Push | Email |
| --- | --- | --- | --- |
| Activation | Yes | Later | No |
| Transaction | Yes | Later | Optional |
| Deal | Yes | Later | Optional |
| Review | Yes | Later | No |
| Risk/operator | Yes | Yes | Optional |
| Retention | Yes | Later | Optional |

## Spam control rules

- Do not send repeated nudges for the same unresolved action too frequently.
- Group low-priority events in activity feed.
- Reserve urgent alerts for deal, dispute, fraud, and operator workflows.
- Let user preferences control non-critical notifications later.

## Historical note

This document was moved from repository root into `docs/product/` during the WorkAI documentation organization batch. The original SkillValue AI notification strategy remains available in git history.
