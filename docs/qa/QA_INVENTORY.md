# QA Inventory - WorkAI 1.0

This document is the master QA inventory for WorkAI 1.0.

## Scope

Every module should be tested across:

- Happy paths
- Edge cases
- Role cases
- Integration dependencies

## Test Matrix Legend

- Member: standard user
- Operator: operations / moderation role
- Admin: administration role
- Mock mode: backend/mobile run with mock or in-memory data
- Staging: near-production deployment environment

## Modules to test

1. Auth
2. Onboarding
3. Profile
4. Home
5. Explore
6. Offers
7. Requests
8. Proposals
9. Deals
10. Payments / Receipts
11. Reviews
12. Trust
13. AI Match
14. AI Price
15. AI Support
16. AI Next Action
17. Inbox / Messages
18. Notifications / Activity
19. Admin Overview
20. Disputes
21. Risk
22. Fraud
23. Operator Reviews
24. Health Check
25. Mock Mode
26. Staging Config

## Cross-module integration flows

### Member core flow

- Signup/login
- Complete onboarding
- Complete profile
- Browse explore/home
- Create offer or request
- Create/send proposal
- Create/fund/submit/release deal
- Leave review
- See trust changes / notifications / activity

### Client-provider deal flow

- Client creates request
- Provider sends proposal
- Client accepts proposal
- Deal created
- Client funds
- Provider submits work
- Client releases funds
- Both sides can review

### Moderation flow

- Deal dispute opened
- Notification/activity created
- Operator sees dispute in admin
- Operator sees risk/fraud context
- Operator submits review action

### AI-assisted flow

- Request detail opens AI match
- Offer creation uses AI price
- Support request classified
- Home/profile shows next action

## Mandatory QA notes

- Every module must be tested with data and empty state.
- Every protected route must be tested with no token, wrong role, and correct role.
- Every AI endpoint must test fallback behavior when AI is unavailable.
- Every mobile list screen must test loading, error, empty, and refresh.
- Every backend response must be checked against the mobile response shape.

## Historical note

This file was moved from the repository root into `docs/qa/` during the WorkAI documentation organization batch. Some detailed legacy QA wording may be preserved in git history.
