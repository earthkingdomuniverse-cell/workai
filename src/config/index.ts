import { env, isDev, isProd, isTest, shouldEnableAdmin, shouldEnableMock } from './env';

export const config = {
  app: {
    env: env.NODE_ENV,
    port: Number(env.PORT),
    host: env.HOST,
    logLevel: env.LOG_LEVEL,
    name: env.APP_NAME,
  },
  api: {
    prefix: env.API_PREFIX,
    version: env.API_VERSION,
  },
  database: {
    url: env.DATABASE_URL || 'file:./dev.db',
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  jwt: {
    secret: env.JWT_SECRET || 'dev-secret',
    expiresIn: env.JWT_EXPIRES_IN,
  },
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  flags: {
    enableMockMode: shouldEnableMock(),
    enableAdminTab: shouldEnableAdmin(),
    enableSwagger: env.ENABLE_SWAGGER === 'true',
  },
  rateLimit: {
    max: Number(env.RATE_LIMIT_MAX),
    window: Number(env.RATE_LIMIT_WINDOW),
  },
} as const;

export { env, isDev, isProd, isTest, shouldEnableAdmin, shouldEnableMock };
