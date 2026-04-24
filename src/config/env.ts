import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.string().default('info'),

  // API
  API_PREFIX: z.string().default('/api'),
  API_VERSION: z.string().default('v1'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),

  // JWT
  JWT_SECRET: z.string().optional().or(z.literal('')),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // Feature Flags
  ENABLE_MOCK_MODE: z.string().default('true'),
  ENABLE_ADMIN_TAB: z.string().default('true'),
  ENABLE_SWAGGER: z.string().default('true'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_WINDOW: z.string().default('60000'),

  // App
  APP_NAME: z.string().default('SkillValue AI Backend'),
  DATABASE_URL: z.string().optional(),
  // Zalo integration
  ZALO_APP_ID: z.string().optional(),
  ZALO_APP_SECRET: z.string().optional(),
  ZALO_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const envVars = {
    NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'development',
    PORT: process.env.PORT || '3000',
    HOST: process.env.HOST || '0.0.0.0',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    API_PREFIX: process.env.API_PREFIX || '/api',
    API_VERSION: process.env.API_VERSION || 'v1',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ENABLE_MOCK_MODE: process.env.ENABLE_MOCK_MODE || 'true',
    ENABLE_ADMIN_TAB: process.env.ENABLE_ADMIN_TAB || 'true',
    ENABLE_SWAGGER: process.env.ENABLE_SWAGGER || 'true',
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || '100',
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '60000',
    APP_NAME: process.env.APP_NAME || 'SkillValue AI Backend',
    DATABASE_URL: process.env.DATABASE_URL,
  };

  const parsed = envSchema.safeParse(envVars);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();

export function isDev(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProd(): boolean {
  return env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

export function shouldEnableMock(): boolean {
  return env.ENABLE_MOCK_MODE === 'true';
}

export function shouldEnableAdmin(): boolean {
  return env.ENABLE_ADMIN_TAB === 'true';
}
