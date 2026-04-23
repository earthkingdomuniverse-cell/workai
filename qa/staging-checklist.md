# Staging Environment QA Checklist

## Scope

- Staging environment setup
- Deployment verification
- Configuration

## QA Tasks

### 1. Backend Health

#### 1.1 Health Check

- Test: GET /health or /
- Expected: 200 OK

#### 1.2 API Responds

- Test: Any API endpoint
- Expected: Returns valid response

### 2. Mobile Configuration

#### 2.1 API Base URL

- Test: Mobile points to staging URL
- Expected: Staging API base

#### 2.2 Environment Variables

- Test: All required env vars set
- Expected: No undefined vars

### 3. Auth on Staging

#### 3.1 Login Works

- Test: Login on staging
- Expected: Returns token

#### 3.2 Token Valid

- Test: Use token on protected endpoints
- Expected: Works

### 4. Database on Staging

#### 4.1 DB Accessible

- Test: Queries work
- Expected: Data accessible

#### 4.2 Seed Data

- Test: Seed data exists
- Expected: Test data available

### 5. AI Configuration

#### 5.1 AI Enabled

- Test: /ai/match, /ai/price, /ai/support
- Expected: Depends on config

#### 5.2 AI Mock Mode

- Test: If no AI key
- Expected: Falls back to heuristics

### 6. Mock Flags

#### 6.1 Staging Mock Mode

- Test: Flag to use mocks instead of DB
- Expected: Works if DB unavailable

---

## Environment Variables Needed

```bash
# Backend
DATABASE_URL=
API_PORT=3000
JWT_SECRET=

# Mobile (staging)
API_BASE_URL=https://staging-api.example.com
```

## Current Staging Status

| Component     | Status                |
| ------------- | --------------------- |
| Backend       | Unknown - needs setup |
| Mobile config | Needs staging URL     |
| Database      | Unknown               |
| Seed data     | Unknown               |
| AI            | Uses mock             |
