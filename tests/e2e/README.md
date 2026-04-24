# End-to-End Tests

## Overview

E2E tests use Playwright to test the full application flow in a real browser environment.

## Directory Structure

```
tests/e2e/
├── playwright.config.ts          # Playwright configuration
├── page-objects/                 # Page Object Models
│   ├── base-page.ts             # Base page class
│   ├── login-page.ts            # Login page
│   ├── dashboard-page.ts        # Dashboard page
│   └── ...                      # Other pages
├── fixtures/                     # Test fixtures
│   ├── auth-fixture.ts          # Auth fixture
│   └── .auth/                   # Auth state storage
├── auth/                         # Auth setup
│   └── auth.setup.ts            # Authentication setup
├── specs/                        # Test specs
│   ├── auth/                    # Auth tests
│   ├── assessment/              # Assessment tests
│   └── ...                      # Other features
└── utils/                        # Utilities
    ├── test-helpers.ts         # Test helpers
    └── test-ids.ts             # Test ID registry
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- login.e2e.spec.ts

# Run with UI mode
npm run test:e2e -- --ui

# Run on specific browser
npm run test:e2e -- --project=chromium

# Run in debug mode
npm run test:e2e -- --debug

# Run smoke tests only
npm run test:e2e:smoke
```

## Writing Tests

### Using Page Objects

```typescript
import { test } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');

  await loginPage.expectLoginSuccess();
});
```

### Using Fixtures

```typescript
import { test, expect } from '../fixtures/auth-fixture';

test('authenticated user can view dashboard', async ({ page, dashboardPage }) => {
  await dashboardPage.goto();
  await dashboardPage.expectDashboardLoaded();
});
```

## Test Data

Test users are defined in `/tests/fixtures/users.fixture.ts`:

- candidate_free@example.com / Test@123456
- candidate_premium@example.com / Test@123456
- admin@example.com / Admin@Secure789

## Configuration

Tests run against:

- Local: http://localhost:3000
- Staging: https://staging.skillvalue.ai
- Production: https://skillvalue.ai (smoke tests only)

## Best Practices

1. **Use Page Objects**: Encapsulate page logic
2. **Use data-testid**: Prefer over CSS selectors
3. **Independent tests**: Each test should be standalone
4. **Cleanup**: Always clean up test data
5. **Wait for elements**: Use Playwright's auto-waiting

## Troubleshooting

```bash
# Install browsers
npx playwright install

# Update browsers
npx playwright install --with-deps

# Show report
npx playwright show-report

# Trace viewer
npx playwright trace-viewer trace.zip
```
