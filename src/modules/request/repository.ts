import { Request, RequestInput, RequestFilter } from './types';
import { mockRequests } from '../../mocks/requests';

export interface RequestRepository {
  findAll(filters?: RequestFilter): Promise<Request[]>;
  findById(id: string): Promise<Request | null>;
  findByRequesterId(requesterId: string): Promise<Request[]>;
  create(data: RequestInput & { requesterId: string }): Promise<Request>;
  update(id: string, data: Partial<RequestInput>): Promise<Request>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  incrementLikes(id: string): Promise<void>;
  incrementProposals(id: string): Promise<void>;
}

class InMemoryRequestRepository implements RequestRepository {
  private requests: Request[] = [...mockRequests];

  async findAll(filters?: RequestFilter): Promise<Request[]> {
    let result = [...this.requests];

    if (filters) {
      const {
        query,
        category,
        minBudget,
        maxBudget,
        skills,
        status,
        experienceLevel,
        urgency,
        location,
        requesterId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      if (query) {
        const queryLower = query.toLowerCase();
        result = result.filter(
          (r) =>
            r.title.toLowerCase().includes(queryLower) ||
            r.description.toLowerCase().includes(queryLower),
        );
      }

      if (category) {
        result = result.filter((r) => r.category === category);
      }

      if (minBudget !== undefined) {
        result = result.filter((r) => r.budget?.min >= minBudget || r.budget?.max >= minBudget);
      }

      if (maxBudget !== undefined) {
        result = result.filter((r) => r.budget?.min <= maxBudget || r.budget?.max <= maxBudget);
      }

      if (skills && skills.length > 0) {
        result = result.filter((r) => r.skills?.some((skill) => skills.includes(skill)));
      }

      if (status) {
        result = result.filter((r) => r.status === status);
      }

      if (experienceLevel) {
        result = result.filter((r) => r.experienceLevel === experienceLevel);
      }

      if (urgency) {
        result = result.filter((r) => r.urgency === urgency);
      }

      if (location) {
        result = result.filter((r) => r.location?.type === location);
      }

      if (requesterId) {
        result = result.filter((r) => r.requesterId === requesterId);
      }

      // Sort
      const sorted = [...result].sort((a, b) => {
        let compare = 0;
        switch (sortBy) {
          case 'budget':
            compare = (b.budget?.max || 0) - (a.budget?.max || 0);
            break;
          case 'proposals':
            compare = (b.proposalsCount || 0) - (a.proposalsCount || 0);
            break;
          case 'urgency': {
            const urgencyOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
            compare = (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
            break;
          }
          case 'createdAt':
          default:
            compare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            break;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });

      result = sorted;
    }

    return result;
  }

  async findById(id: string): Promise<Request | null> {
    return this.requests.find((r) => r.id === id) || null;
  }

  async findByRequesterId(requesterId: string): Promise<Request[]> {
    return this.requests.filter((r) => r.requesterId === requesterId);
  }

  async create(data: RequestInput & { requesterId: string }): Promise<Request> {
    const request: Request = {
      id: `request_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      requesterId: data.requesterId,
      title: data.title,
      description: data.description,
      category: data.category,
      budget: data.budget,
      status: 'open',
      skills: data.skills,
      deadline: data.deadline,
      location: data.location,
      duration: data.duration,
      experienceLevel: data.experienceLevel,
      urgency: data.urgency || 'medium',
      proposalsCount: 0,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requests.push(request);
    return request;
  }

  async update(id: string, data: Partial<RequestInput>): Promise<Request> {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Request ${id} not found`);
    }

    const updated: Request = {
      ...this.requests[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.requests[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Request ${id} not found`);
    }
    this.requests.splice(index, 1);
  }

  async incrementViews(id: string): Promise<void> {
    const request = await this.findById(id);
    if (request) {
      request.views = (request.views || 0) + 1;
    }
  }

  async incrementLikes(id: string): Promise<void> {
    const request = await this.findById(id);
    if (request) {
      request.likes = (request.likes || 0) + 1;
    }
  }

  async incrementProposals(id: string): Promise<void> {
    const request = await this.findById(id);
    if (request) {
      request.proposalsCount = (request.proposalsCount || 0) + 1;
    }
  }
}

export const requestRepository: RequestRepository = new InMemoryRequestRepository();
