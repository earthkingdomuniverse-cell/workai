# WorkAI

Backend + mobile workspace for WorkAI Official Product 1.0.

WorkAI is an AI-native social marketplace operating system for turning skills, knowledge, time, services, trust, and problem-solving ability into tradable value. The backend and mobile workspace are designed around offers, requests, proposals, deals, AI copilot workflows, trust/risk/fraud systems, and operator/admin workflows.

## Documentation

Most project documents are organized under [`docs/`](docs/README.md):

- Architecture: [`docs/architecture/`](docs/architecture/)
- Product docs: [`docs/product/`](docs/product/)
- Launch docs: [`docs/launch/`](docs/launch/)
- Marketing docs: [`docs/marketing/`](docs/marketing/)
- Monetization docs: [`docs/monetization/`](docs/monetization/)
- QA docs: [`docs/qa/`](docs/qa/)
- Reports: [`docs/reports/`](docs/reports/)

## Status

- Backend TypeScript build passes: `npm run typecheck` and `npm run build`
- Backend currently runs in mock-first mode
- Mobile source tree exists under `mobile/`, but this repo currently does not include a standalone `mobile/package.json`

## Install

```bash
npm install
```

## Environment

1. Copy env file:

```bash
cp .env.example .env
```

2. Key variables:

- `PORT=3000`
- `API_PREFIX=/api`
- `API_VERSION=v1`
- `ENABLE_MOCK_MODE=true`
- `OPENAI_API_KEY=` optional
- `EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1`

## Run Backend Dev

```bash
npm run dev
```

Backend URLs:

- Health: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/docs`
- API base: `http://localhost:3000/api/v1`

## Run Backend Build

```bash
npm run typecheck
npm run build
npm start
```

## Mock / Seed Strategy

- This repo currently uses in-memory mock data under `src/mocks/`
- No separate seed command is required
- Reset backend state by restarting the server

## API Smoke Tests

### Auth

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup -H 'Content-Type: application/json' -d '{"email":"demo@example.com","role":"member"}'
curl -X POST http://localhost:3000/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"demo@example.com","role":"operator"}'
curl http://localhost:3000/api/v1/auth/me
```

### Offers / Requests / Proposals / Deals

```bash
curl http://localhost:3000/api/v1/offers
curl http://localhost:3000/api/v1/requests
curl http://localhost:3000/api/v1/proposals
curl http://localhost:3000/api/v1/deals
```

### Transactions / Receipts / Trust / Reviews

```bash
curl http://localhost:3000/api/v1/transactions
curl http://localhost:3000/api/v1/trust/me
curl http://localhost:3000/api/v1/reviews
```

### AI Endpoints

```bash
curl -X POST http://localhost:3000/api/v1/ai/match -H 'Content-Type: application/json' -d '{"title":"Build ecommerce app","skills":["React","Node.js"],"budget":{"min":3000,"max":7000},"urgency":"high"}'
curl -X POST http://localhost:3000/api/v1/ai/price -H 'Content-Type: application/json' -d '{"title":"Landing page build","skills":["React","UI"],"providerLevel":"intermediate"}'
```

### Admin / Operator Endpoints

Current guard is mock-friendly. For real authz hardening, replace mock bearer flow with persisted sessions.

```bash
curl http://localhost:3000/api/v1/admin/overview
curl http://localhost:3000/api/v1/admin/disputes
curl http://localhost:3000/api/v1/admin/risk
curl http://localhost:3000/api/v1/admin/fraud
curl http://localhost:3000/api/v1/admin/reviews
curl -X POST http://localhost:3000/api/v1/admin/review -H 'Content-Type: application/json' -d '{"reviewId":"review_1","action":"approve_release","note":"Approved by operator"}'
```

## Mobile Notes

- Mobile config is read from `mobile/src/constants/config.ts`
- Set `EXPO_PUBLIC_API_URL` to your backend base URL
- Enable mock mode with `EXPO_PUBLIC_ENABLE_MOCK_MODE=true`
- Mobile runtime packaging is not fully wired in this repo yet

## Main Mock Areas Remaining

- Messaging / realtime delivery
- Notifications persistence
- AI OpenAI live integration
- Admin moderation persistence
- Payment processor integration
- Mobile runtime packaging and Expo bootstrapping
