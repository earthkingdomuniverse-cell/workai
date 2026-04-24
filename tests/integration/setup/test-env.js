/**
 * Test Environment Setup
 * Task 1.3: Integration Test Configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Random port
process.env.LOG_LEVEL = 'error';

// Database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/workai_test';

// JWT
process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
process.env.JWT_EXPIRES_IN = '1h';

// External services (mocked)
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

process.env.OPENAI_API_KEY = 'test-openai-key';

process.env.REDIS_URL = 'redis://localhost:6379/1';

// Disable rate limiting in tests
process.env.RATE_LIMIT_ENABLED = 'false';

// Feature flags
process.env.ENABLE_SWAGGER = 'false';
process.env.ENABLE_MOCK_MODE = 'true';
