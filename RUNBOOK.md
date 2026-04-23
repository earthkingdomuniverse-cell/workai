# RUNBOOK

## 1. Prepare Environment

```bash
cp .env.example .env
npm install
```

Recommended local values:

```env
ENABLE_MOCK_MODE=true
ENABLE_SWAGGER=true
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## 2. Start Backend

```bash
npm run dev
```

## 3. Validate Core Health

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/offers
curl http://localhost:3000/api/v1/requests
```

## 4. Validate Marketplace Flow

```bash
curl http://localhost:3000/api/v1/proposals
curl http://localhost:3000/api/v1/deals
curl http://localhost:3000/api/v1/reviews
curl http://localhost:3000/api/v1/trust/me
```

## 5. Validate AI Flow

```bash
curl -X POST http://localhost:3000/api/v1/ai/match -H 'Content-Type: application/json' -d '{"title":"Need React dashboard","skills":["React","TypeScript"],"budget":{"min":1000,"max":4000},"urgency":"medium"}'
curl -X POST http://localhost:3000/api/v1/ai/price -H 'Content-Type: application/json' -d '{"title":"React dashboard","skills":["React","TypeScript"],"providerLevel":"expert"}'
```

## 6. Validate Admin / Operator Flow

```bash
curl http://localhost:3000/api/v1/admin/overview
curl http://localhost:3000/api/v1/admin/disputes
curl http://localhost:3000/api/v1/admin/risk
curl http://localhost:3000/api/v1/admin/fraud
curl http://localhost:3000/api/v1/admin/reviews
```

## 7. Build Verification

```bash
npm run typecheck
npm run build
```

## 8. Known Operational Limits

- Data is in-memory and resets on restart
- Several modules are mock-backed and not yet persisted to DB
- Mobile app source exists, but Expo packaging is not fully wired inside this repo
