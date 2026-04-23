# AI User Simulation Scripts

Các script tự động tạo dữ liệu thật và fix lỗi cho SkillValue AI.

## Scripts Available

### 1. AI User Simulator (`ai-user-simulator.ts`)

Tạo synthetic users với AI để populate hệ thống.

```bash
# Tạo 10 users với full interaction
npx ts-node scripts/ai-user-simulator.ts --count=10 --actions=create,interact

# Chỉ tạo users (không tạo offers/requests)
npx ts-node scripts/ai-user-simulator.ts --count=5 --actions=create

# Tạo 20 users với tương tác đầy đủ
npx ts-node scripts/ai-user-simulator.ts --count=20
```

**What it does:**
- Tạo users với realistic profiles (AI-generated bio)
- Tạo offers với AI-generated titles/descriptions
- Tạo requests với AI-generated content
- Skills ngẫu nhiên từ pool 23 skills
- Mỗi user có hourly rate và goals khác nhau

**Yêu cầu:**
- `OPENAI_API_KEY` hoặc `EXPO_PUBLIC_OPENAI_API_KEY` trong .env
- Backend chạy tại `EXPO_PUBLIC_API_URL`

---

### 2. Agent Interaction Orchestrator (`agent-interaction-orchestrator.ts`)

Điều phối nhiều AI agents tương tác với nhau.

```bash
# Chạy 5 cycles với 8 agents
npx ts-node scripts/agent-interaction-orchestrator.ts --cycles=5 --agents=8

# Chạy 3 cycles (default)
npx ts-node scripts/agent-interaction-orchestrator.ts
```

**What it does:**
- Tạo provider agents (tạo offers)
- Tạo client agents (tạo requests)
- Chạy full deal cycle:
  1. Providers → Create offers
  2. Clients → Create requests
  3. Clients → Create proposals
  4. Providers → Accept proposals → Create deals
  5. Clients → Fund deals
  6. Providers → Submit work
  7. Clients → Release funds + Review
- Tạo realistic transaction history

**Output:**
- Multiple completed deals
- Reviews with ratings
- Funded transactions
- Activity feed data

---

### 3. Fix Deal Schema (`fix-deal-schema.ts`)

Phân tích và fix Deal interface mismatch.

```bash
npx ts-node scripts/fix-deal-schema.ts
```

**What it does:**
- So sánh mobile vs backend Deal interface
- List các field mismatch
- Generate correct interface
- Hướng dẫn manual fix

---

### 4. Add Mock Fallbacks (`add-mock-fallbacks.ts`)

Tự động thêm mock fallback vào services chưa có.

```bash
npx ts-node scripts/add-mock-fallbacks.ts
```

**What it fixes:**
- `dealService.ts` - thêm mockDeals
- `proposalService.ts` - thêm mockProposals
- `aiService.ts` - thêm mockRecommendations

**Lưu ý:** Script này chỉ phân tích và generate code. Cần manual copy/paste để tránh risk.

---

## Installation

```bash
# Install dependencies
cd scripts
npm install

# Hoặc cài global
cd /Users/lha/Documents/workai
npm install -g ts-node typescript dotenv openai @faker-js/faker axios
```

## Environment Variables

Tạo `.env` trong thư mục gốc:

```env
OPENAI_API_KEY=sk-your-openai-key
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Quick Start

```bash
# 1. Seed users
npx ts-node scripts/ai-user-simulator.ts --count=10

# 2. Run interaction cycles
npx ts-node scripts/agent-interaction-orchestrator.ts --cycles=3

# 3. Check data
# - Home: Should show recommendations
# - Offers: Should show AI-generated offers
# - Deals: Should show completed transactions
# - Trust: Should show updated scores
```

## Generated Data

### Users
- 10-50 users with realistic profiles
- Mix of providers và clients
- Different skill sets và hourly rates
- AI-generated professional bios

### Offers
- 5-20 offers per run
- AI-generated titles và descriptions
- Varied pricing (fixed/hourly)
- Realistic delivery times

### Requests
- 3-15 requests per run
- Varied budgets và urgencies
- Different skill requirements

### Deals
- Full lifecycle: Created → Funded → Submitted → Released
- Reviews with ratings 4-5 stars
- Updated trust scores

## Use Cases

### 1. Demo Preparation
```bash
npx ts-node scripts/ai-user-simulator.ts --count=20
npx ts-node scripts/agent-interaction-orchestrator.ts --cycles=5
```
→ Creates rich demo data for investor presentations

### 2. Testing Marketplace Liquidity
```bash
npx ts-node scripts/agent-interaction-orchestrator.ts --cycles=10 --agents=20
```
→ Tests system with high transaction volume

### 3. AI Training Data
- Generated reviews dùng để train recommendation AI
- Deal patterns dùng để train fraud detection
- User behaviors dùng để optimize UX

### 4. Load Testing
- Scale agents để test backend performance
- Monitor response times và error rates

## Troubleshooting

### OpenAI Rate Limit
```bash
# Add delay between requests
# Hoặc dùng fallback mode
MOCK_MODE_ONLY=true npx ts-node scripts/ai-user-simulator.ts
```

### Backend Not Running
```bash
# Ensure backend is up
curl http://localhost:3000/api/v1/health

# Start backend if needed
npm run dev  # in backend directory
```

### Duplicate Emails
Script sẽ tự động login thay vì create nếu user đã tồn tại.

## Maintenance

### Clear Simulation Data
```bash
# Xóa tất cả simulation users
curl -X DELETE http://localhost:3000/api/v1/admin/cleanup-simulation
```

### Reset Database
```bash
# Backup first
pg_dump skillvalue > backup.sql

# Reset
npm run db:reset
npm run db:seed
```

## Architecture

```
scripts/
├── ai-user-simulator.ts          # Single user simulation
├── agent-interaction-orchestrator.ts  # Multi-agent orchestration
├── fix-deal-schema.ts            # Schema fix helper
├── add-mock-fallbacks.ts         # Mock fallback generator
└── README.md                     # This file
```

## Future Enhancements

- [ ] WebSocket message simulation
- [ ] Dispute creation simulation
- [ ] Admin action simulation
- [ ] Analytics event simulation
- [ ] Load testing mode

## License

Internal use only - SkillValue AI
