# Staging Environment Configuration

## Environment Variables

### Backend (staging .env)

```
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://user:pass@staging-db:5432/skillvalue
JWT_SECRET=your-staging-jwt-secret-change-in-production
API_URL=https://api-staging.skillvalue.ai
ENABLE_MOCK_MODE=false
LOG_LEVEL=info
```

### Mobile (staging .env)

```
EXPO_PUBLIC_API_URL=https://api-staging.skillvalue.ai/v1
EXPO_PUBLIC_ENABLE_MOCK_MODE=false
EXPO_PUBLIC_ENABLE_ADMIN_TAB=true
```

## Seed Data for Staging

### Test Users

- admin@skillvalue.ai / Admin123! (role: admin)
- operator@skillvalue.ai / Operator123! (role: operator)
- member@skillvalue.ai / Member123! (role: member)

### Sample Data

- 10 Offers (varied skills, prices)
- 10 Requests (varied budgets, urgencies)
- 5 Deals (different statuses)
- Reviews for trust calculation
- Trust profiles with verification levels

## Deployment Commands

```bash
# Deploy to staging (Railway/Render/Heroku)
git push staging main

# Or manual deployment
npm run build
NODE_ENV=staging npm start
```

## Health Checks

```bash
# Backend health
curl https://api-staging.skillvalue.ai/health

# Database connection
curl https://api-staging.skillvalue.ai/api/v1/offers

# Response time should be < 500ms
```
