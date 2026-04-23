export type Role = 'member' | 'operator' | 'admin';
export type Permission = 'read' | 'write' | 'delete' | 'admin';

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface BaseEntity {
  id: string;
}

export interface ApiResult<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    requestId?: string;
    timestamp?: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'VND';

export type DealStatus =
  | 'created'
  | 'funded'
  | 'submitted'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'under_review'
  | 'pending'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ProposalStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'withdrawn'
  | 'negotiating';

export type OfferStatus = 'active' | 'inactive' | 'archived' | 'completed';
export type RequestStatus = 'open' | 'in_progress' | 'completed' | 'archived';

export interface AuditLog {
  action: string;
  actorId: string;
  actorRole: Role;
  timestamp: string;
  details?: Record<string, any>;
}
