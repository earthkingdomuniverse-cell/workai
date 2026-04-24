import { SWARM_CONFIG } from './config';

export class WorkAIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SWARM_CONFIG.apiUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = errorText;
      }
      throw new Error(`API Error ${response.status} at ${endpoint}: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  async signup(email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async createOffer(token: string, data: any) {
    return this.request('/offers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  }

  async createRequest(token: string, data: any) {
    return this.request('/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  }

  async createProposal(token: string, data: any) {
    return this.request('/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  }

  async createDeal(token: string, data: any) {
    return this.request('/deals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  }

  async fundDeal(token: string, dealId: string, amount: number) {
    return this.request(`/deals/${dealId}/fund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount, paymentMethodId: 'pm_card_test' })
    });
  }

  async submitWork(token: string, dealId: string, milestoneId?: string) {
    return this.request(`/deals/${dealId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ milestoneId, notes: 'Automated submission via Swarm Engine' })
    });
  }

  async releaseFunds(token: string, dealId: string, amount: number) {
    return this.request(`/deals/${dealId}/release`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount })
    });
  }

  async createReview(token: string, data: any) {
    return this.request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  }
}
