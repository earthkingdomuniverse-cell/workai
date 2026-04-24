import { env, isDev, isProd, shouldEnableMock, shouldEnableAdmin } from './env';

export const config = {
  app: {
    name: env.APP_NAME,
    env: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    host: env.HOST,
    logLevel: env.LOG_LEVEL,
  },
  api: {
    prefix: env.API_PREFIX,
    version: env.API_VERSION,
  },
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  },
  jwt: {
    secret: env.JWT_SECRET,
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
  zalo: {
    appId: env.ZALO_APP_ID,
    appSecret: env.ZALO_APP_SECRET,
    webhookSecret: env.ZALO_WEBHOOK_SECRET,
  },
  rateLimit: {
    max: parseInt(env.RATE_LIMIT_MAX, 10),
    window: parseInt(env.RATE_LIMIT_WINDOW, 10),
  },
  flags: {
    enableMockMode: shouldEnableMock(),
    enableAdminTab: shouldEnableAdmin(),
    enableSwagger: env.ENABLE_SWAGGER === 'true',
  },
};

export { env, isDev, isProd, shouldEnableMock, shouldEnableAdmin };
export default config;
