# WorkAI Mobile - Official Product 1.0 Architecture

## Purpose

This document locks the file-level architecture for WorkAI Mobile Official Product 1.0.

It is the source of truth for:

- route map
- module map
- service map
- type map
- store/context map
- reusable component map
- mock strategy
- feature flags
- main data flow across the product lifecycle

This architecture is not an MVP blueprint. It is the baseline structure for the official 1.0 product and should be used as the implementation standard for future tasks.

## Product Scope

WorkAI Mobile is an AI-native social marketplace operating system where users turn skills, knowledge, and problem-solving ability into tradable value while AI helps operate onboarding, matching, pricing, support, trust, risk, fraud, retention, and operator workflows.

The architecture must cover all 8 required pillars:

1. Identity & Value Profile
2. Offers
3. Requests
4. Proposal / Quote Layer
5. Deals
6. AI Copilot Layer
7. Trust / Risk / Fraud / Review
8. Operator & Admin OS

## Required Stack

- React Native
- Expo
- Expo Go
- TypeScript
- Expo Router
- AsyncStorage
- Fetch API or dedicated API client
- Context API or Zustand

## Architecture Principles

- File-level clarity first
- Route groups are the main navigation boundary
- Modules own domain logic, types, mocks, screens, and module-specific services
- Shared infra stays in `src/services`, `src/contexts`, `src/store`, and `src/components`
- All role-based navigation must be protected with real guards
- Each implemented module must include types, services, screens, loading/error/empty states, and mock fallback when backend is not ready
- Mock contracts must stay 1:1 compatible with production contracts
- Avoid shallow placeholders for completed tasks

## Route Map

### Public Routes

- `/`
- `/welcome`
- `/auth/login`
- `/auth/signup`
- `/auth/forgot-password`
- `/auth/verify-otp`
- `/auth/complete-account`

### Onboarding Routes

- `/identity`
- `/value-profile`
- `/skills`
- `/work-preferences`
- `/trust-verification`
- `/onboarding-review`

### Core Authenticated Routes

- `/home`
- `/search`
- `/inbox`
- `/notifications`
- `/activity`

### Profile Routes

- `/profile`
- `/profile/edit`
- `/profile/portfolio`
- `/profile/verification`
- `/profile/reputation`
- `/profile/transaction-history`

### Offer Routes

- `/offers`
- `/offers/create`
- `/offers/mine`
- `/offers/[offerId]`
- `/offers/[offerId]/edit`

### Request Routes

- `/requests`
- `/requests/create`
- `/requests/mine`
- `/requests/[requestId]`
- `/requests/[requestId]/edit`

### Proposal Routes

- `/proposals`
- `/proposals/create`
- `/proposals/incoming`
- `/proposals/[proposalId]`
- `/proposals/[proposalId]/edit`

### Deal Routes

- `/deals`
- `/deals/mine`
- `/deals/[dealId]`
- `/deals/[dealId]/fund`
- `/deals/[dealId]/submit`
- `/deals/[dealId]/release`
- `/deals/[dealId]/dispute`
- `/deals/[dealId]/receipt`

### Review Routes

- `/reviews`
- `/reviews/create`
- `/reviews/[reviewId]`

### Trust Routes

- `/trust`
- `/trust/score`
- `/trust/verification`
- `/trust/risk-alerts`
- `/trust/fraud-report`

### AI Routes

- `/ai/copilot`
- `/ai/match`
- `/ai/pricing`
- `/ai/support`
- `/ai/next-action`

### Payment Routes

- `/payments/methods`
- `/payments/receipts`
- `/payments/payout-settings`

### Settings Routes

- `/settings`
- `/settings/account`
- `/settings/privacy`
- `/settings/notifications`
- `/settings/feature-flags`

### Operator Routes

- `/dashboard`
- `/review-queue`
- `/disputes`
- `/users`
- `/deals`
- `/fraud-signals`
- `/content-moderation`
- `/support`

### Admin Routes

- `/overview`
- `/risk-center`
- `/trust-operations`
- `/operator-audit`
- `/feature-management`
- `/system-config`

## Route Group and Guard Map

### Route Groups

- `(public)`: unauthenticated and pre-auth access
- `(onboarding)`: authenticated but onboarding incomplete
- `(app)`: authenticated and onboarding complete
- `(operator)`: operator and admin-only tools
- `(admin)`: admin-only tools

### Guard Rules

- Public routes: no session required
- Onboarding routes: authenticated user required, `onboardingCompleted === false`
- App routes: authenticated user required, `onboardingCompleted === true`
- Operator routes: role `operator` or `admin`
- Admin routes: role `admin`

### Guard Source of Truth

- `src/contexts/session-context.tsx`
- `src/contexts/role-guard-context.tsx`
- `app/**/_layout.tsx`
- `src/guards/`

## Module Map

- `auth`: signup, login, otp verification, account completion, session, logout
- `onboarding`: identity, value profile, skills, work preferences, verification intake, readiness state
- `profile`: public profile, edit profile, portfolio, reputation, verification, transaction history
- `offers`: list, create, detail, edit, own offers, archive state
- `requests`: list, create, detail, edit, own requests, archive state
- `proposals`: quote creation, negotiation summary, proposal detail, proposal edit, incoming proposals
- `deals`: accepted proposal to active deal, milestone lifecycle, fund, submit, release, dispute, receipt
- `payments`: payment methods, payment readiness, payout settings, funding actions
- `receipts`: receipts, settlement records, proof artifacts, transaction views
- `reviews`: create review, review detail, review list, post-deal bilateral feedback
- `trust`: trust score, trust factors, verification state, reputation aggregate
- `risk`: risk alerts, case status, account signals, escalation timeline
- `fraud`: suspicious activity, fraud reporting, evidence bundle, fraud case links
- `ai`: copilot, matching, pricing, support, next-action flows
- `messages`: thread list, thread detail, composer state, attachment metadata, unread state
- `notifications`: notification feed, preferences, badges, in-app alerts
- `activity`: activity feed and lifecycle events visible to user
- `operator`: review queue, support operations, moderation, dispute handling, fraud operations
- `admin`: overview, risk center, trust operations, operator audit, system config, feature management

## Main Data Flow

1. Profile: user completes identity, value profile, skills and work preferences. Output: profile readiness and trust baseline.
2. Offer / Request: qualified users create marketplace listings. Output: an offer or request.
3. Proposal: proposals derive from offers or requests. Output: structured quote and negotiation state.
4. Deal: accepted proposal becomes a deal. Output: funded/submitted/released/disputed deal lifecycle.
5. Review: completed deals open bilateral review. Output: rating, review, moderation state.
6. Trust: trust aggregates verification, completion rate, review quality, dispute ratio and fraud signals.
7. Admin / Risk: operators and admins consume review queues, disputes, fraud signals and risk alerts.

## Implementation Notes for Future Tasks

- Do not collapse this architecture into an MVP shape.
- Future tasks should implement only the requested scope while staying inside this file-level structure.
- If a task introduces a new domain concern, it must fit into the existing route, module, service, type, and store maps unless there is a product-level reason to revise this architecture.
