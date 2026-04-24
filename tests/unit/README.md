# Unit Tests

## Directory Structure

```
tests/unit/
├── __mocks__/           # Jest mocks
│   ├── fileMock.js      # Static file mock
│   └── styleMock.js     # CSS/SCSS mock
├── fixtures/            # Test data fixtures
│   └── users.fixture.ts
├── setup/               # Test setup files
│   ├── env.setup.js     # Environment setup
│   └── jest.setup.ts    # Jest configuration
├── utils/               # Test utilities
│   └── test-helpers.ts  # Helper functions
└── jest.config.js       # Jest configuration
```

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit:coverage

# Run in watch mode
npm run test:unit:watch

# Run specific file
npm run test:unit -- path/to/file.test.ts
```

## Writing Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mockUser } from '@unit/fixtures/users.fixture';

describe('UserService', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should create user successfully', () => {
    // Arrange
    const userData = mockUser;

    // Act
    const result = createUser(userData);

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        email: userData.email,
        status: 'active',
      }),
    );
  });
});
```

## Coverage Requirements

- Global: 80% minimum
- Services: 85% minimum
- Utils: 90% minimum
