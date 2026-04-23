# SkillValue AI Mobile - Official Product 1.0 Architecture

## Purpose

This document locks the file-level architecture for SkillValue AI Mobile Official Product 1.0.

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

SkillValue AI Mobile is an AI-native social marketplace operating system where users turn skills, knowledge, and problem-solving ability into tradable value while AI helps operate onboarding, matching, pricing, support, trust, risk, fraud, retention, and operator workflows.

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

## Module Internal File Pattern

Every module under `src/modules/<module>/` should follow this structure when implementation begins:

```text
src/modules/<module>/
├── components/
├── constants.ts
├── hooks/
├── mocks/
├── schemas.ts
├── screens/
├── services/
├── store/
├── types.ts
└── utils.ts
```

This pattern keeps each domain modular while still allowing shared infra elsewhere.

## Service Map

### Core Infrastructure Services

- `ApiClientService`
- `SessionService`
- `StorageService`
- `FeatureFlagService`
- `MockGatewayService`
- `NetworkStatusService`
- `ErrorReportingService`

### Domain Services

- `AuthService`
- `OnboardingService`
- `ProfileService`
- `OffersService`
- `RequestsService`
- `ProposalsService`
- `DealsService`
- `PaymentsService`
- `ReceiptsService`
- `ReviewsService`
- `TrustService`
- `RiskService`
- `FraudService`
- `AiCopilotService`
- `AiMatchService`
- `AiPricingService`
- `AiSupportService`
- `AiNextActionService`
- `MessagesService`
- `NotificationsService`
- `ActivityService`
- `OperatorService`
- `AdminService`

## Type Map

### System Types

- `Role`
- `Permission`
- `ApiResult<T>`
- `PaginatedResult<T>`
- `AsyncState<T>`
- `AppFeatureFlags`
- `AppBootstrapState`

### Auth Types

- `AuthUser`
- `AuthSession`
- `SignupPayload`
- `LoginPayload`

### Profile and Onboarding Types

- `UserProfile`
- `IdentityProfile`
- `ValueProfile`
- `SkillTag`
- `PortfolioItem`
- `WorkPreference`
- `VerificationStatus`
- `ReputationSummary`

### Marketplace Types

- `Offer`
- `OfferPricing`
- `OfferAvailability`
- `Request`
- `RequestBudget`
- `Proposal`
- `ProposalQuote`
- `ProposalStatus`

### Deal and Payment Types

- `Deal`
- `DealStatus`
- `DealMilestone`
- `DealFundingStatus`
- `Receipt`
- `TransactionHistoryItem`

### Review, Trust, Risk, Fraud Types

- `Review`
- `ReviewRating`
- `TrustScore`
- `TrustFactor`
- `RiskSignal`
- `RiskLevel`
- `FraudReport`
- `ModerationCase`
- `DisputeCase`

### AI Types

- `AiMatchRequest`
- `AiMatchResult`
- `AiPriceRequest`
- `AiPriceResult`
- `AiSupportRequest`
- `AiSupportResponse`
- `AiNextActionRequest`
- `AiNextActionResult`
- `AiCopilotSession`

### Communication Types

- `MessageThread`
- `Message`
- `NotificationItem`
- `ActivityItem`

### Admin and Operator Types

- `AdminOverview`
- `ReviewQueueItem`
- `FeatureFlagRule`

## Store and Context Map

### Contexts

- `SessionContext`
- `FeatureFlagContext`
- `AppBootstrapContext`
- `RoleGuardContext`

### Stores

- `useAuthStore`
- `useProfileStore`
- `useMarketplaceStore`
- `useDealStore`
- `useInboxStore`
- `useNotificationStore`
- `useTrustStore`
- `useAdminStore`
- `useAppStore`

### Store Responsibilities

- `useAuthStore`: auth state, session, login/logout, account bootstrap
- `useProfileStore`: profile, onboarding progress, verification summary, user readiness
- `useMarketplaceStore`: offers, requests, proposals, filters, list/detail cache
- `useDealStore`: deal detail, milestones, funding state, submission, receipts
- `useInboxStore`: threads, active thread, unread counts, send state
- `useNotificationStore`: feed, badges, preferences, seen state
- `useTrustStore`: trust score, trust factors, reviews summary, risk alerts
- `useAdminStore`: dashboards, queues, moderation state, operator/admin actions
- `useAppStore`: app bootstrap, maintenance mode, connectivity, global UI readiness

## Reusable Component Map

### Base UI Components

- `Screen`
- `TopBar`
- `PrimaryButton`
- `SecondaryButton`
- `TextField`
- `SearchInput`
- `SelectField`
- `MoneyInput`
- `Tag`
- `Badge`
- `Avatar`

### Loading, Error, and Empty Components

- `LoadingState`
- `ErrorState`
- `EmptyState`
- `RetryBlock`
- `InlineError`
- `SkeletonCard`

### Card Components

- `OfferCard`
- `RequestCard`
- `ProposalCard`
- `DealCard`
- `ReviewCard`
- `TrustScoreCard`
- `RiskAlertCard`
- `NotificationCard`
- `ActivityCard`

### List Components

- `PaginatedList`
- `FilterBar`
- `SortBar`
- `SectionListBlock`

### Form Components

- `FormSection`
- `FormActions`
- `ValidationMessage`
- `AttachmentPickerRow`

### Chat Components

- `ThreadListItem`
- `MessageBubble`
- `ComposerBar`
- `SystemMessageRow`

### Deal and Trust Components

- `MilestoneTimeline`
- `FundingStatusPill`
- `ReceiptSummary`
- `VerificationBadge`
- `ReputationStrip`
- `FraudSignalBanner`

### Layout and Guard Components

- `GuardedScreen`
- `RoleGate`
- `AppContainer`
- `StickyFooterActions`

## Mock Strategy

### Core Strategy

- every service has an API implementation and a mock implementation
- mock responses must match the backend contract 1:1
- mock fallback is allowed only through explicit architecture rules, not ad hoc screen logic

### Resolution Order

1. feature flag evaluation
2. environment evaluation
3. endpoint readiness or availability evaluation
4. mock fallback if enabled

### Mock Rules

- mock data must cover loading states
- mock data must cover error states
- mock data must cover empty states
- mock data must cover happy paths
- mock data must cover role-based access paths
- mock data must cover trust/risk/fraud states
- mock data must cover offer/request/proposal/deal lifecycle states

### Recommended Mock Layout

```text
src/services/mocks/
├── admin/
├── ai/
├── auth/
├── deals/
├── offers/
├── profile/
├── proposals/
├── requests/
├── reviews/
└── trust/
```

Module-local domain fixtures can also live under `src/modules/<module>/mocks/` when they are closely tied to screen states.

## Feature Flags

- `auth_email_login_enabled`
- `auth_signup_enabled`
- `onboarding_identity_step_enabled`
- `onboarding_verification_step_enabled`
- `offers_creation_enabled`
- `requests_creation_enabled`
- `proposals_enabled`
- `deal_escrow_enabled`
- `deal_dispute_enabled`
- `reviews_enabled`
- `trust_score_enabled`
- `risk_alerts_enabled`
- `fraud_reporting_enabled`
- `ai_match_enabled`
- `ai_pricing_enabled`
- `ai_support_enabled`
- `ai_next_action_enabled`
- `messages_enabled`
- `notifications_enabled`
- `operator_console_enabled`
- `admin_console_enabled`
- `mock_fallback_enabled`

## Main Data Flow

### 1. Profile

- user completes identity
- user completes value profile
- user completes skills and work preferences
- user reaches verification summary
- output: `UserProfile`, `ValueProfile`, profile readiness, trust baseline

### 2. Offer / Request

- only users passing the proper readiness guard can create marketplace listings
- output: `Offer` or `Request`

### 3. Proposal

- proposals derive from offers or requests
- proposal includes scope, timeline, pricing, terms, and negotiation state
- output: `Proposal`

### 4. Deal

- accepted proposal becomes a `Deal`
- deal lifecycle covers funding, work execution, submission, release, and dispute
- output: active deal state, milestone state, receipt path

### 5. Review

- completed deal opens bilateral review flow
- output: rating, review content, moderation state

### 6. Trust

- trust aggregates verification, completion rate, review quality, dispute ratio, and fraud signals
- output: `TrustScore`, trust factors, trust-facing UI state

### 7. Admin / Risk

- operator and admin consume review queues, disputes, fraud signals, and risk alerts
- output: moderation action, case resolution, penalties, trust adjustment, audit history

## Screen List

### Public and Auth Screens

- `WelcomeScreen`
- `LoginScreen`
- `SignupScreen`
- `ForgotPasswordScreen`
- `VerifyOtpScreen`
- `CompleteAccountScreen`

### Onboarding Screens

- `IdentityScreen`
- `ValueProfileScreen`
- `SkillsScreen`
- `WorkPreferencesScreen`
- `TrustVerificationScreen`
- `OnboardingReviewScreen`

### Core App Screens

- `HomeScreen`
- `SearchScreen`
- `InboxScreen`
- `NotificationsScreen`
- `ActivityScreen`

### Profile Screens

- `ProfileScreen`
- `EditProfileScreen`
- `PortfolioScreen`
- `VerificationScreen`
- `ReputationScreen`
- `TransactionHistoryScreen`

### Offer Screens

- `OffersListScreen`
- `CreateOfferScreen`
- `OfferDetailScreen`
- `EditOfferScreen`
- `MyOffersScreen`

### Request Screens

- `RequestsListScreen`
- `CreateRequestScreen`
- `RequestDetailScreen`
- `EditRequestScreen`
- `MyRequestsScreen`

### Proposal Screens

- `ProposalsListScreen`
- `CreateProposalScreen`
- `ProposalDetailScreen`
- `EditProposalScreen`
- `IncomingProposalsScreen`

### Deal Screens

- `DealsListScreen`
- `DealDetailScreen`
- `FundDealScreen`
- `SubmitDealScreen`
- `ReleaseDealScreen`
- `DisputeDealScreen`
- `DealReceiptScreen`
- `MyDealsScreen`

### Review and Trust Screens

- `ReviewsListScreen`
- `CreateReviewScreen`
- `ReviewDetailScreen`
- `TrustOverviewScreen`
- `TrustScoreScreen`
- `TrustVerificationStatusScreen`
- `RiskAlertsScreen`
- `FraudReportScreen`

### AI Screens

- `AiCopilotScreen`
- `AiMatchScreen`
- `AiPricingScreen`
- `AiSupportScreen`
- `AiNextActionScreen`

### Payment and Settings Screens

- `PaymentMethodsScreen`
- `ReceiptsScreen`
- `PayoutSettingsScreen`
- `SettingsScreen`
- `AccountSettingsScreen`
- `PrivacySettingsScreen`
- `NotificationSettingsScreen`
- `FeatureFlagsScreen`

### Operator and Admin Screens

- `OperatorDashboardScreen`
- `ReviewQueueScreen`
- `DisputesScreen`
- `UsersModerationScreen`
- `DealsOpsScreen`
- `FraudSignalsScreen`
- `ContentModerationScreen`
- `SupportOpsScreen`
- `AdminOverviewScreen`
- `RiskCenterScreen`
- `TrustOperationsScreen`
- `OperatorAuditScreen`
- `FeatureManagementScreen`
- `SystemConfigScreen`

## Service List

- `ApiClientService`
- `SessionService`
- `StorageService`
- `FeatureFlagService`
- `MockGatewayService`
- `NetworkStatusService`
- `ErrorReportingService`
- `AuthService`
- `OnboardingService`
- `ProfileService`
- `OffersService`
- `RequestsService`
- `ProposalsService`
- `DealsService`
- `PaymentsService`
- `ReceiptsService`
- `ReviewsService`
- `TrustService`
- `RiskService`
- `FraudService`
- `AiCopilotService`
- `AiMatchService`
- `AiPricingService`
- `AiSupportService`
- `AiNextActionService`
- `MessagesService`
- `NotificationsService`
- `ActivityService`
- `OperatorService`
- `AdminService`

## Type List

- `Role`
- `Permission`
- `AuthUser`
- `AuthSession`
- `SignupPayload`
- `LoginPayload`
- `UserProfile`
- `IdentityProfile`
- `ValueProfile`
- `SkillTag`
- `PortfolioItem`
- `WorkPreference`
- `VerificationStatus`
- `ReputationSummary`
- `Offer`
- `OfferPricing`
- `OfferAvailability`
- `Request`
- `RequestBudget`
- `Proposal`
- `ProposalQuote`
- `ProposalStatus`
- `Deal`
- `DealStatus`
- `DealMilestone`
- `DealFundingStatus`
- `Receipt`
- `TransactionHistoryItem`
- `Review`
- `ReviewRating`
- `TrustScore`
- `TrustFactor`
- `RiskSignal`
- `RiskLevel`
- `FraudReport`
- `ModerationCase`
- `DisputeCase`
- `AiMatchRequest`
- `AiMatchResult`
- `AiPriceRequest`
- `AiPriceResult`
- `AiSupportRequest`
- `AiSupportResponse`
- `AiNextActionRequest`
- `AiNextActionResult`
- `AiCopilotSession`
- `MessageThread`
- `Message`
- `NotificationItem`
- `ActivityItem`
- `AdminOverview`
- `ReviewQueueItem`
- `FeatureFlagRule`
- `ApiResult<T>`
- `PaginatedResult<T>`
- `AsyncState<T>`
- `AppFeatureFlags`
- `AppBootstrapState`

## Planned App Tree

```text
skillvalue-ai-mobile/
├── README_ARCHITECTURE.md
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── +not-found.tsx
│   ├── (public)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   └── auth/
│   │       ├── login.tsx
│   │       ├── signup.tsx
│   │       ├── forgot-password.tsx
│   │       ├── verify-otp.tsx
│   │       └── complete-account.tsx
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── identity.tsx
│   │   ├── value-profile.tsx
│   │   ├── skills.tsx
│   │   ├── work-preferences.tsx
│   │   ├── trust-verification.tsx
│   │   └── onboarding-review.tsx
│   ├── (app)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── inbox.tsx
│   │   ├── notifications.tsx
│   │   ├── activity.tsx
│   │   ├── profile/
│   │   │   ├── index.tsx
│   │   │   ├── edit.tsx
│   │   │   ├── portfolio.tsx
│   │   │   ├── verification.tsx
│   │   │   ├── reputation.tsx
│   │   │   └── transaction-history.tsx
│   │   ├── offers/
│   │   │   ├── index.tsx
│   │   │   ├── create.tsx
│   │   │   ├── mine.tsx
│   │   │   ├── [offerId].tsx
│   │   │   └── [offerId]/edit.tsx
│   │   ├── requests/
│   │   │   ├── index.tsx
│   │   │   ├── create.tsx
│   │   │   ├── mine.tsx
│   │   │   ├── [requestId].tsx
│   │   │   └── [requestId]/edit.tsx
│   │   ├── proposals/
│   │   │   ├── index.tsx
│   │   │   ├── create.tsx
│   │   │   ├── incoming.tsx
│   │   │   ├── [proposalId].tsx
│   │   │   └── [proposalId]/edit.tsx
│   │   ├── deals/
│   │   │   ├── index.tsx
│   │   │   ├── mine.tsx
│   │   │   ├── [dealId].tsx
│   │   │   ├── [dealId]/fund.tsx
│   │   │   ├── [dealId]/submit.tsx
│   │   │   ├── [dealId]/release.tsx
│   │   │   ├── [dealId]/dispute.tsx
│   │   │   └── [dealId]/receipt.tsx
│   │   ├── reviews/
│   │   │   ├── index.tsx
│   │   │   ├── create.tsx
│   │   │   └── [reviewId].tsx
│   │   ├── trust/
│   │   │   ├── index.tsx
│   │   │   ├── score.tsx
│   │   │   ├── verification.tsx
│   │   │   ├── risk-alerts.tsx
│   │   │   └── fraud-report.tsx
│   │   ├── ai/
│   │   │   ├── copilot.tsx
│   │   │   ├── match.tsx
│   │   │   ├── pricing.tsx
│   │   │   ├── support.tsx
│   │   │   └── next-action.tsx
│   │   ├── payments/
│   │   │   ├── methods.tsx
│   │   │   ├── receipts.tsx
│   │   │   └── payout-settings.tsx
│   │   └── settings/
│   │       ├── index.tsx
│   │       ├── account.tsx
│   │       ├── privacy.tsx
│   │       ├── notifications.tsx
│   │       └── feature-flags.tsx
│   ├── (operator)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── review-queue.tsx
│   │   ├── disputes.tsx
│   │   ├── users.tsx
│   │   ├── deals.tsx
│   │   ├── fraud-signals.tsx
│   │   ├── content-moderation.tsx
│   │   └── support.tsx
│   └── (admin)/
│       ├── _layout.tsx
│       ├── overview.tsx
│       ├── risk-center.tsx
│       ├── trust-operations.tsx
│       ├── operator-audit.tsx
│       ├── feature-management.tsx
│       └── system-config.tsx
├── src/
│   ├── components/
│   │   ├── cards/
│   │   ├── chat/
│   │   ├── deal/
│   │   ├── form/
│   │   ├── layout/
│   │   ├── lists/
│   │   ├── states/
│   │   ├── trust/
│   │   └── ui/
│   ├── config/
│   ├── constants/
│   ├── contexts/
│   ├── guards/
│   ├── hooks/
│   ├── modules/
│   │   ├── activity/
│   │   ├── admin/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── deals/
│   │   ├── fraud/
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── offers/
│   │   ├── onboarding/
│   │   ├── operator/
│   │   ├── payments/
│   │   ├── profile/
│   │   ├── proposals/
│   │   ├── receipts/
│   │   ├── requests/
│   │   ├── reviews/
│   │   ├── risk/
│   │   └── trust/
│   ├── navigation/
│   ├── schemas/
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── feature-flags/
│   │   ├── mocks/
│   │   ├── realtime/
│   │   ├── session/
│   │   └── storage/
│   ├── store/
│   ├── types/
│   └── utils/
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

## Implementation Notes for Future Tasks

- Do not collapse this architecture into an MVP shape.
- Future tasks should implement only the requested scope while staying inside this file-level structure.
- If a task introduces a new domain concern, it must fit into the existing route, module, service, type, and store maps unless there is a product-level reason to revise this architecture.
