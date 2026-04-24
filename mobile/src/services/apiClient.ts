import { API_URL } from '../constants/config';

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshHandler: (() => Promise<string | null>) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setRefreshHandler(handler: () => Promise<string | null>) {
    this.refreshHandler = handler;
  }

  private async request<T = any>(endpoint: string, options?: RequestInit & { _isRetry?: boolean }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      if (
        response.status === 401 &&
        this.refreshHandler &&
        !options?._isRetry &&
        !endpoint.includes('/auth/refresh')
      ) {
        try {
          const newToken = await this.refreshHandler();
          if (newToken) {
            this.setToken(newToken);
            return this.request<T>(endpoint, { ...options, _isRetry: true });
          }
        } catch (refreshErr) {
          // Refresh failed, proceed to throw original error
        }
      }
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
