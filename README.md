# WorkAI Platform

WorkAI là một AI marketplace giúp kết nối người có nhu cầu công việc với người có kỹ năng thực thi, đồng thời giảm ma sát trong matching, pricing, trust và dispute resolution. Repo này không chỉ là backend demo; nó được tổ chức như một product workspace với backend API, mobile app, vận hành GitHub-native và bộ tài liệu product đi kèm.

## 📊 Status & Quality

[![CI Pipeline](https://github.com/earthkingdomuniverse-cell/workai/actions/workflows/ci.yml/badge.svg)](https://github.com/earthkingdomuniverse-cell/workai/actions/workflows/ci.yml)
[![Security Scan](https://github.com/earthkingdomuniverse-cell/workai/actions/workflows/codeql.yml/badge.svg)](https://github.com/earthkingdomuniverse-cell/workai/actions/workflows/codeql.yml)
[![Docker Image](https://github.com/earthkingdomuniverse-cell/workai/actions/workflows/docker-ghcr.yml/badge.svg)](https://github.com/earthkingdomuniverse-cell/workai/actions/workflows/docker-ghcr.yml)
[![Docs Portal](https://github.com/earthkingdomuniverse-cell/workai/actions/workflows/deploy.yml/badge.svg)](https://github.com/earthkingdomuniverse-cell/workai/actions/workflows/deploy.yml)

- **Product surface**: backend API, mobile app, AI workflows, admin/trust operations.
- **CI/CD**: GitHub Actions cho lint, typecheck, test coverage, build và release/docs workflows.
- **Security**: GitHub CodeQL, Dependabot và audit automation.
- **Distribution**: GitHub Pages cho portal docs, GitHub Releases cho artifact, GHCR cho container image.

## Product Positioning

WorkAI nhắm tới ba nhóm chính:

- **Clients**: tạo request, nhận matching, so sánh proposal, theo dõi deal.
- **Professionals / Providers**: công bố offer, nhận gợi ý việc phù hợp, quản lý trust score và review.
- **Operators / Admins**: giám sát risk, fraud, dispute và chất lượng marketplace.

Giá trị cốt lõi của product:

- **Faster matching**: AI hỗ trợ kết nối nhu cầu với kỹ năng phù hợp.
- **Safer transactions**: trust signals, review, risk scoring và moderation flow.
- **Operational clarity**: admin surface cho dispute, fraud và release decisions.
- **Product-ready workflow**: repo, docs, release và community flow được đóng gói như một sản phẩm thực thụ.

## Product Modules

- **Marketplace Core**: requests, offers, proposals, deals, transactions.
- **AI Layer**: match, price recommendation, support, next action.
- **Trust Layer**: reviews, trust scoring, fraud signals, admin moderation.
- **Experience Layer**: Expo mobile app, onboarding, profile, notifications, activity.
- **Operations Layer**: GitHub-native CI, Pages, release, issue forms, templates và security policy.

## GitHub-Native Product Ops

WorkAI được đóng gói để có thể vận hành chủ yếu bằng hạ tầng miễn phí của GitHub:

- `GitHub Actions`: backend CI, Pages deploy, repo health jobs.
- `GitHub CodeQL`: SAST cho TypeScript.
- `Dependabot`: cập nhật dependency cho backend, mobile và workflows.
- `GitHub Pages`: public docs / product portal từ `docs/`.
- `GitHub Releases`: artifact cho các tag `v*`.
- `GitHub Container Registry`: publish image nếu cần môi trường chạy container.
- `Issues + PR templates`: tiếp nhận bug report, feature request và feedback theo chuẩn product.

## Product Docs

- [PRODUCT.md](PRODUCT.md)
- [docs/index.html](docs/index.html)
- [docs/roadmap.md](docs/roadmap.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)

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

## Product Roadmap Snapshot

- **Phase 1**: mock-first marketplace core and AI-assisted flows.
- **Phase 2**: productization of mobile UX, admin operations and release hygiene.
- **Phase 3**: persistence, payments, real authz, live AI integration and production analytics.
