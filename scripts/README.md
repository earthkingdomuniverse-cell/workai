# WorkAI AI User Simulation Scripts

Các script tự động tạo dữ liệu demo, mô phỏng user, và hỗ trợ kiểm thử cho WorkAI.

## Scripts Available

### 1. AI User Simulator (`ai-user-simulator.ts`)

Tạo synthetic users với AI để populate hệ thống.

```bash
npx ts-node scripts/ai-user-simulator.ts --count=10 --actions=create,interact
npx ts-node scripts/ai-user-simulator.ts --count=5 --actions=create
npx ts-node scripts/ai-user-simulator.ts --count=20
```

**What it does:**

- Tạo users với realistic profiles.
- Tạo offers với AI-generated titles/descriptions.
- Tạo requests với AI-generated content.
- Dùng skill pool để tạo marketplace data.
- Mỗi user có hourly rate và goals khác nhau.

**Yêu cầu:**

- `OPENAI_API_KEY` hoặc `EXPO_PUBLIC_OPENAI_API_KEY` trong `.env` nếu dùng AI live.
- Backend chạy tại `EXPO_PUBLIC_API_URL`.

---

### 2. Agent Interaction Orchestrator (`agent-interaction-orchestrator.ts`)

Điều phối nhiều AI agents tương tác với nhau.

```bash
npx ts-node scripts/agent-interaction-orchestrator.ts --cycles=5 --agents=8
npx ts-node scripts/agent-interaction-orchestrator.ts
```

**What it does:**

- Tạo provider agents.
- Tạo client/requester agents.
- Chạy full deal cycle:
  1. Providers create offers.
  2. Clients create requests.
  3. Clients create proposals.
  4. Providers accept proposals.
  5. Clients fund deals.
  6. Providers submit work.
  7. Clients release funds and review.

**Output:**

- Completed deals.
- Reviews with ratings.
- Funded transactions.
- Activity feed data.

---

### 3. Fix Deal Schema (`fix-deal-schema.ts`)

Phân tích và fix Deal interface mismatch.

```bash
npx ts-node scripts/fix-deal-schema.ts
```

---

### 4. Add Mock Fallbacks (`add-mock-fallbacks.ts`)

Tự động thêm mock fallback vào services chưa có.

```bash
npx ts-node scripts/add-mock-fallbacks.ts
```

**Lưu ý:** Script này chỉ phân tích và generate code. Cần manual copy/paste để tránh risk.

---

## Installation

```bash
cd scripts
npm install
```

Hoặc cài ở repo root:

```bash
npm install -g ts-node typescript dotenv openai @faker-js/faker axios
```

## Environment Variables

Tạo `.env` trong thư mục gốc:

```env
OPENAI_API_KEY=<your-openai-key>
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Quick Start

```bash
npx ts-node scripts/ai-user-simulator.ts --count=10
npx ts-node scripts/agent-interaction-orchestrator.ts --cycles=3
```

## Generated Data

### Users

- 10-50 users with realistic profiles.
- Mix of providers and clients.
- Different skill sets and hourly rates.
- AI-generated professional bios if AI is enabled.

### Offers

- AI-generated or template-generated titles and descriptions.
- Varied pricing.
- Realistic delivery times.

### Requests

- Varied budgets and urgencies.
- Different skill requirements.

### Deals

- Full lifecycle: created, funded, submitted, released.
- Reviews and trust-score movement.

## Use Cases

### Demo preparation

```bash
npx ts-node scripts/ai-user-simulator.ts --count=20
npx ts-node scripts/agent-interaction-orchestrator.ts --cycles=5
```

### Testing marketplace liquidity

```bash
npx ts-node scripts/agent-interaction-orchestrator.ts --cycles=10 --agents=20
```

### AI training / evaluation data

- Generated reviews can support recommendation evaluation.
- Deal patterns can support fraud/risk evaluation.
- User behaviors can support UX optimization.

### Load testing

- Scale agents to test backend performance.
- Monitor response times and error rates.

## Troubleshooting

### OpenAI rate limit

```bash
MOCK_MODE_ONLY=true npx ts-node scripts/ai-user-simulator.ts
```

### Backend not running

```bash
curl http://localhost:3000/api/v1/health
npm run dev
```

### Duplicate emails

Scripts should login instead of creating duplicate users when supported.

## Maintenance

### Clear simulation data

```bash
curl -X DELETE http://localhost:3000/api/v1/admin/cleanup-simulation
```

### Reset database

```bash
pg_dump workai > backup.sql
npm run db:reset
npm run db:seed
```

## Architecture

```text
scripts/
├── ai-user-simulator.ts
├── agent-interaction-orchestrator.ts
├── fix-deal-schema.ts
├── add-mock-fallbacks.ts
└── README.md
```

## Future Enhancements

- [ ] WebSocket message simulation
- [ ] Dispute creation simulation
- [ ] Admin action simulation
- [ ] Analytics event simulation
- [ ] Load testing mode

## License

Internal use only - WorkAI
