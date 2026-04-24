# WorkAI Staging Environment Configuration

## Purpose

Staging setup notes for WorkAI backend and mobile app.

## Backend environment

```text
NODE_ENV=staging
PORT=3000
DATABASE_URL=<staging-database-url>
JWT_SECRET=<staging-jwt-secret>
API_URL=<staging-api-url>
ENABLE_MOCK_MODE=false
LOG_LEVEL=info
```

## Mobile environment

```text
EXPO_PUBLIC_API_URL=<staging-api-url>/api/v1
EXPO_PUBLIC_ENABLE_MOCK_MODE=false
EXPO_PUBLIC_ENABLE_ADMIN_TAB=true
EXPO_PUBLIC_APP_NAME=WorkAI
```

## Seed data for staging

Recommended roles:

- admin test user
- operator test user
- member test user

Recommended sample data:

- Offers across key launch categories
- Requests across budgets and urgency levels
- Deals across created, funded, submitted, released, and disputed states
- Reviews for trust calculation
- Trust profiles with verification levels

## Deployment commands

```bash
npm run build
NODE_ENV=staging npm start
```

## Health checks

```bash
curl <staging-api-url>/health
curl <staging-api-url>/api/v1/offers
```

Expected response time target: under 500ms for core health and read endpoints.

## Security note

Do not commit real staging credentials or demo passwords. Use environment variables and a secrets manager.

## Historical note

This file was moved from the repository root into `docs/launch/` during the WorkAI documentation organization batch. Credential-like examples from the root file were intentionally removed.
