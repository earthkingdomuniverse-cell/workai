# Mock Data & API Mocking

## Overview

Mock data generators and API handlers using MSW (Mock Service Worker) for consistent test data.

## Structure

```
tests/mocks/
├── generate-mock-data.ts     # Data generators
├── server.ts                 # Node.js server (tests)
├── browser.ts                # Browser worker (dev)
├── handlers/                 # API handlers
│   ├── auth.handlers.ts
│   └── assessment.handlers.ts
└── README.md
```

## Data Generators

```typescript
import {
  generateMockUser,
  generateMockAssessment,
  generateMockResult,
  generateMockApiResponse,
} from './generate-mock-data';

// Generate single user
const user = generateMockUser({ role: 'admin' });

// Generate multiple
const users = generateMockUsers(10);

// Generate API response
const response = generateMockApiResponse(user);
```

## Using in Tests

```typescript
import { server } from '../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Available Generators

| Function                    | Returns              |
| --------------------------- | -------------------- |
| `generateMockUser()`        | User object          |
| `generateMockAssessment()`  | Assessment object    |
| `generateMockQuestion()`    | Question object      |
| `generateMockResult()`      | Result object        |
| `generateMockApiResponse()` | API response wrapper |
| `generateMockApiError()`    | Error response       |
| `generateMockPagination()`  | Paginated data       |

## Mock Handlers

### Auth

- POST /auth/login
- POST /auth/register
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me

### Assessments

- GET /assessments (paginated)
- GET /assessments/:id
- POST /assessments
- PUT /assessments/:id
- DELETE /assessments/:id
