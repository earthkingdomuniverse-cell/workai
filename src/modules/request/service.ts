import { requestRepository } from './repository';
import { Request, RequestInput, RequestFilter } from './types';
import { AppError } from '../../lib/errors';
import { mockRequests } from '../../mocks/requests';

export async function getRequests(filters?: RequestFilter): Promise<Request[]> {
  return requestRepository.findAll(filters);
}

export async function getRequestById(id: string): Promise<Request | null> {
  return requestRepository.findById(id);
}

export async function getRequestsByRequesterId(requesterId: string): Promise<Request[]> {
  return requestRepository.findByRequesterId(requesterId);
}

export async function createRequest(requesterId: string, data: RequestInput): Promise<Request> {
  // Validate
  if (!data.title.trim()) {
    throw new AppError('Title is required', { code: 'VALIDATION_ERROR' });
  }
  if (!data.description.trim()) {
    throw new AppError('Description is required', { code: 'VALIDATION_ERROR' });
  }
  if (data.budget && data.budget.min > data.budget.max) {
    throw new AppError('Minimum budget cannot exceed maximum budget', { code: 'VALIDATION_ERROR' });
  }

  return requestRepository.create({ ...data, requesterId });
}

export async function updateRequest(
  id: string,
  userId: string,
  data: Partial<RequestInput>,
): Promise<Request> {
  const request = await getRequestById(id);

  if (!request) {
    throw new AppError('Request not found', { code: 'NOT_FOUND_ERROR', statusCode: 404 });
  }

  if (request.requesterId !== userId) {
    throw new AppError('Not authorized to update this request', {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
    });
  }

  return requestRepository.update(id, data);
}

export async function deleteRequest(id: string, userId: string): Promise<void> {
  const request = await getRequestById(id);

  if (!request) {
    throw new AppError('Request not found', { code: 'NOT_FOUND_ERROR', statusCode: 404 });
  }

  if (request.requesterId !== userId) {
    throw new AppError('Not authorized to delete this request', {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
    });
  }

  await requestRepository.delete(id);
}

export async function updateRequestStatus(
  id: string,
  userId: string,
  status: 'open' | 'in_progress' | 'completed' | 'archived',
): Promise<Request> {
  const request = await getRequestById(id);

  if (!request) {
    throw new AppError('Request not found', { code: 'NOT_FOUND_ERROR', statusCode: 404 });
  }

  if (request.requesterId !== userId) {
    throw new AppError('Not authorized to update this request', {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
    });
  }

  return requestRepository.update(id, { status } as any);
}

export async function incrementRequestViews(id: string): Promise<void> {
  await requestRepository.incrementViews(id);
}

export async function incrementRequestLikes(id: string): Promise<void> {
  await requestRepository.incrementLikes(id);
}

export async function incrementRequestProposals(id: string): Promise<void> {
  await requestRepository.incrementProposals(id);
}

export async function getRequestStats(requesterId?: string): Promise<{
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  archived: number;
  totalProposals: number;
  totalViews: number;
  averageBudget: number;
}> {
  const requests = requesterId ? await getRequestsByRequesterId(requesterId) : mockRequests;

  return {
    total: requests.length,
    open: requests.filter((r) => r.status === 'open').length,
    inProgress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    archived: requests.filter((r) => r.status === 'archived').length,
    totalProposals: requests.reduce((sum, r) => sum + (r.proposalsCount || 0), 0),
    totalViews: requests.reduce((sum, r) => sum + (r.views || 0), 0),
    averageBudget:
      requests.length > 0
        ? requests.reduce((sum, r) => sum + (r.budget?.max || r.budget?.min || 0), 0) /
          requests.length
        : 0,
  };
}

export async function getUrgentRequests(): Promise<Request[]> {
  const filters: RequestFilter = {
    urgency: 'urgent',
    status: 'open',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };
  return getRequests(filters);
}
