import { env } from '../../src/config/env';

export const SWARM_CONFIG = {
  // Use EXPO_PUBLIC_API_URL if available, otherwise local backend
  apiUrl: process.env.EXPO_PUBLIC_API_URL || env.APP_URL + env.API_PREFIX + '/' + env.API_VERSION || 'http://localhost:3000/api/v1',
  nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // Default models
  models: {
    nvidia: 'meta/llama-3.1-70b-instruct',
    openai: 'gpt-4o-mini'
  },
  
  // Default generation settings
  defaultSettings: {
    users: 50,
    offersPerUser: 2,
    requestsPerUser: 1,
    aiProvider: 'faker', // 'nvidia', 'openai', 'faker'
    delayMs: 200, // delay between api calls to prevent rate limiting
  }
};
