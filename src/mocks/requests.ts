import { Request } from '../types/request';

export const mockRequests: Request[] = [
  {
    id: 'request_1',
    requesterId: 'user_2',
    title: 'E-commerce Platform Development',
    description:
      'Looking for an experienced developer to build a complete e-commerce platform with payment integration, inventory management, and admin dashboard.',
    category: 'Software Development',
    budget: {
      min: 8000,
      max: 15000,
      currency: 'USD',
      negotiable: true,
    },
    status: 'open',
    urgency: 'high',
    skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration'],
    deadline: '2024-04-01T00:00:00Z',
    location: {
      type: 'remote',
    },
    duration: {
      value: 3,
      unit: 'months',
    },
    experienceLevel: 'expert',
    proposalsCount: 15,
    views: 342,
    likes: 28,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'request_2',
    requesterId: 'user_1',
    title: 'Mobile App UI Design',
    description:
      'Need a modern, clean UI design for a fitness tracking mobile application. Should include designs for both iOS and Android.',
    category: 'Design',
    budget: {
      min: 2000,
      max: 4000,
      currency: 'USD',
      negotiable: false,
    },
    status: 'open',
    urgency: 'medium',
    skills: ['Figma', 'Mobile Design', 'UI/UX'],
    deadline: '2024-03-01T00:00:00Z',
    location: {
      type: 'remote',
    },
    duration: {
      value: 2,
      unit: 'weeks',
    },
    experienceLevel: 'intermediate',
    proposalsCount: 8,
    views: 198,
    likes: 16,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'request_3',
    requesterId: 'user_2',
    title: 'Data Analysis for Marketing Campaign',
    description:
      'Analyze marketing campaign data and provide insights and recommendations. Experience with Google Analytics and data visualization required.',
    category: 'Data Science',
    budget: {
      min: 1000,
      max: 2000,
      currency: 'USD',
      negotiable: true,
    },
    status: 'in_progress',
    urgency: 'low',
    skills: ['Data Analysis', 'Google Analytics', 'Excel', 'Data Visualization'],
    deadline: '2024-02-15T00:00:00Z',
    location: {
      type: 'remote',
    },
    duration: {
      value: 1,
      unit: 'weeks',
    },
    experienceLevel: 'intermediate',
    proposalsCount: 12,
    views: 156,
    likes: 9,
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
];

export function getRequestById(id: string): Request | undefined {
  return mockRequests.find((r) => r.id === id);
}

export function getRequestsByRequesterId(requesterId: string): Request[] {
  return mockRequests.filter((r) => r.requesterId === requesterId);
}

export function createRequest(
  requestData: Partial<Request> & { requesterId: string; title: string; description: string },
): Request {
  const request: Request = {
    id: `request_${Date.now()}`,
    requesterId: requestData.requesterId,
    title: requestData.title,
    description: requestData.description,
    category: requestData.category,
    budget: requestData.budget,
    status: requestData.status || 'open',
    urgency: requestData.urgency,
    skills: requestData.skills,
    proposalsCount: 0,
    views: 0,
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockRequests.push(request);
  return request;
}
