# WorkAI Launch Scope 1.0

## Purpose

This document defines the locked launch scope for WorkAI 1.0.

## Launch philosophy

Ship what works. Defer what does not. Cut what distracts.

If a feature is not listed as must-have, it is not part of the 1.0 launch scope.

## Launch blockers

- Auth/session stability
- Payment or pseudo-payment flow clarity
- Deal escrow/funding workflow clarity
- App store or Expo packaging readiness
- Production/staging database migration readiness
- Core analytics and support escalation readiness

## Must-have at launch

### Auth

- Email/password signup and login
- Password reset or documented limitation
- Role loading for member/operator/admin
- Session restore and logout

### Onboarding

- Profile creation
- Skill setup
- Goal setup
- Onboarding completion tracking

### Offers

- Create offer
- View offers
- Offer detail
- Manage own offers
- AI price guidance where available

### Requests

- Create request
- View requests
- Request detail
- AI match entry point

### Proposals

- Submit proposal
- View proposal detail
- My proposals
- Accept/reject if enabled

### Deals

- Create deal
- Fund / submit / release / dispute flow or documented mock limitation
- Deal detail and timeline

### AI

- AI match
- AI price
- AI support
- Fallback behavior when live AI is unavailable

### Trust / Reviews

- Trust score display
- Review display and submission where deal state allows
- Fraud and risk concepts available to admin/operator

### Messaging and Notifications

- Inbox and notification surfaces usable
- If realtime is not available, fallback polling/mock mode must be documented

### Admin / Operator

- Admin overview
- Disputes
- Risk
- Fraud
- Operator review flow
- Role guard for member/operator/admin

## Can ship with limitation

- Mock-first data for modules not fully backed by persistence
- Pseudo-payment instead of real processor
- Polling instead of realtime messaging
- Simplified trust algorithm
- Manual operator review instead of automated enforcement

## Explicitly out of scope for 1.0

- Full enterprise dashboard
- Blockchain/crypto payments
- Full desktop web app
- Full realtime infrastructure if not already ready
- Advanced AI negotiation or contract generation
- Physical goods marketplace

## Launch recommendation

Soft launch / limited release is the safest WorkAI 1.0 path until persistence, payments, mobile packaging, and realtime operations are hardened.

## Historical note

This document was moved from the repository root into `docs/launch/` during the WorkAI documentation organization batch. The original detailed launch-scope text remains available in git history.
