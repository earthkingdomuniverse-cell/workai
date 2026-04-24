# WorkAI Onboarding Activation Upgrade

## Purpose

Upgrade onboarding so users reach first value faster, ideally creating a first offer or request within 10 minutes after onboarding completion.

## Current flow

Intro -> Role select -> Profile setup -> Skills setup -> Goals setup -> Home

## Target outcome

A user should complete onboarding, understand the next action, and create a first offer or request quickly.

## Key upgrades

### Profile setup

- Add `wantTo` field: find work, find provider, or both.
- Add bio helper and character counter.
- Encourage a clear value statement instead of a generic profile.

### Skills setup

- Suggest top skills based on role and intent.
- Group skills by category.
- Allow clear skill selection with minimum 1 skill.

### Goals setup

- Convert free-text goals into templates.
- Provider examples: find projects, build portfolio, earn extra income.
- Requester examples: find help for projects, build team, test quality.
- Feed goals into AI next-action recommendations.

### Home first session

- Show AI welcome card.
- Provider: create first offer.
- Requester: post first request.
- Show quick action buttons.

## First-session checklist

| Step | Action | Target time |
| --- | --- | --- |
| 1 | Complete onboarding | Under 3 minutes |
| 2 | Open home | Under 30 seconds |
| 3 | See AI suggestion | Immediate |
| 4 | Tap create offer/request | Under 1 minute |
| 5 | Fill form | Under 3 minutes |
| 6 | Submit | Under 30 seconds |
| 7 | View listing | Immediate |

## First-value milestones

| Milestone | Definition | Target |
| --- | --- | --- |
| Onboarding complete | Profile reaches basic threshold | Under 5 minutes after signup |
| First offer/request | Listing created | Under 10 minutes after onboarding |
| First view | Listing viewed | Under 24 hours |
| First proposal | Proposal sent or received | Under 48 hours |
| First deal | Deal created | Under 7 days |

## Activation nudges

| Trigger | Message intent | Action |
| --- | --- | --- |
| Onboarding complete | Start first action | Create offer/request |
| Has profile, no offer | Start provider loop | Offer create |
| Has offer, no proposal | Browse matched requests | View matches |
| Has request, no proposal | Find matched providers | Browse offers / AI match |

## Files likely affected

- `mobile/app/(onboarding)/profile-setup.tsx`
- `mobile/app/(onboarding)/skills-setup.tsx`
- `mobile/app/(onboarding)/goals-setup.tsx`
- `mobile/app/(tabs)/home.tsx`
- `mobile/src/services/aiService.ts`

## Success metrics

| Metric | Target |
| --- | --- |
| First offer/request time | Under 10 minutes |
| Onboarding completion | 70%+ |
| Home to first action | 60%+ |
| Post-onboarding D1 retention | 50%+ |

## Historical note

This document was moved from the repository root into `docs/product/` during the WorkAI documentation organization batch. The original detailed spec remains available in git history.
