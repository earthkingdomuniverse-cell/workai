import { apiClient } from './apiClient';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
  timestamp: string;
}

class HealthService {
  async check(): Promise<HealthStatus> {
    try {
      const response = await apiClient.get<HealthStatus>('/health');
      return {
        status: 'ok',
        ...response,
      };
    } catch (error) {
      return {
        status: 'down',
        version: 'unknown',
        uptime: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const healthService = new HealthService();
