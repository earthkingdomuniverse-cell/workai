import apiClient from './apiClient';

interface ApiResponse<T> {
  data?: T;
  result?: T;
  payload?: T;
  message?: string;
}

export interface AdminOverview {
  totalUsers: number;
  totalDeals: number;
  activeDeals: number;
  activeOffers: number;
  openRequests: number;
  pendingDisputes: number;
  pendingReviews: number;
  riskSignals?: number;
  fraudSignals?: number;
}

export interface AdminListResponse<T> {
  items: T[];
  total?: number;
}

function unwrap<T>(response: ApiResponse<T> | T): T {
  const maybe = response as ApiResponse<T>;
  if (maybe?.data !== undefined) return maybe.data;
  if (maybe?.result !== undefined) return maybe.result;
  if (maybe?.payload !== undefined) return maybe.payload;
  return response as T;
}

function numberFrom(...values: any[]): number {
  const value = values.find((item) => item !== undefined && item !== null && item !== '');
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeOverview(raw: any): AdminOverview {
  const unwrapped = unwrap(raw);
  const stats = unwrapped?.stats || unwrapped?.overview?.stats || unwrapped?.overview || unwrapped || {};

  return {
    totalUsers: numberFrom(stats.totalUsers, stats.users, stats.userCount),
    totalDeals: numberFrom(stats.totalDeals, stats.deals, stats.dealCount),
    activeDeals: numberFrom(stats.activeDeals, stats.openDeals, stats.dealsActive),
    activeOffers: numberFrom(stats.activeOffers, stats.totalOffers, stats.offers, stats.offerCount),
    openRequests: numberFrom(stats.openRequests, stats.totalRequests, stats.requests, stats.requestCount),
    pendingDisputes: numberFrom(stats.pendingDisputes, stats.activeDisputes, stats.disputes),
    pendingReviews: numberFrom(stats.pendingReviews, stats.reviews),
    riskSignals: numberFrom(stats.riskSignals, stats.risk),
    fraudSignals: numberFrom(stats.fraudSignals, stats.fraud),
  };
}

function normalizeList<T>(raw: any): AdminListResponse<T> {
  const source = raw?.items ? raw : raw?.data?.items ? raw.data : raw || {};
  const items = Array.isArray(source.items) ? source.items : Array.isArray(source) ? source : [];
  return { items, total: Number(source.total ?? items.length) };
}

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const response = await apiClient.get<ApiResponse<any>>('/admin/overview');
    return normalizeOverview(response);
  },

  async getDisputes(): Promise<AdminListResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/admin/disputes');
    return normalizeList(unwrap(response));
  },

  async resolveDispute(id: string, resolution: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/disputes/${id}/resolve`, {
      resolution,
    });
    return unwrap(response);
  },

  async getRiskProfiles(): Promise<AdminListResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/admin/risk');
    return normalizeList(unwrap(response));
  },

  async getUserRiskProfile(userId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/risk/${userId}`);
    return unwrap(response);
  },

  async getFraudSignals(): Promise<AdminListResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/admin/fraud');
    return normalizeList(unwrap(response));
  },

  async getUserFraudSignals(userId: string): Promise<AdminListResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/fraud/user/${userId}`);
    return normalizeList(unwrap(response));
  },

  async getPendingReviews(): Promise<AdminListResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/admin/reviews');
    return normalizeList(unwrap(response));
  },

  async processReviewAction(reviewId: string, action: string, note?: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/admin/review', {
      reviewId,
      action,
      note,
    });
    return unwrap(response);
  },

  async flagReview(reviewId: string, flags: string[]): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/review/${reviewId}/flag`, {
      flags,
    });
    return unwrap(response);
  },
};

export default adminService;
