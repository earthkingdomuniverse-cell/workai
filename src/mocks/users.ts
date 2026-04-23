import { User, UserProfile } from '../types/user';

export const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'john.doe@example.com',
    role: 'member',
    permissions: ['read', 'write'],
    onboardingCompleted: true,
    trustScore: 92,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user_2',
    email: 'jane.smith@example.com',
    role: 'member',
    permissions: ['read', 'write'],
    onboardingCompleted: true,
    trustScore: 88,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'user_3',
    email: 'operator@example.com',
    role: 'operator',
    permissions: ['read', 'write', 'delete'],
    onboardingCompleted: true,
    trustScore: 95,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'user_4',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    onboardingCompleted: true,
    trustScore: 100,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

export const mockProfiles: UserProfile[] = [
  {
    id: 'profile_1',
    userId: 'user_1',
    displayName: 'John Doe',
    bio: 'Experienced software developer specializing in AI and machine learning solutions.',
    avatarUrl: 'https://example.com/avatars/john.jpg',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning'],
    goals: ['Find new clients', 'Build my portfolio'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'profile_2',
    userId: 'user_2',
    displayName: 'Jane Smith',
    bio: 'Creative designer with 5+ years of experience in UI/UX and brand design.',
    avatarUrl: 'https://example.com/avatars/jane.jpg',
    location: 'New York, NY',
    website: 'https://janesmith.design',
    skills: ['Figma', 'Adobe Creative Suite', 'UI/UX', 'Branding'],
    goals: ['Grow my network', 'Learn new skills'],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email === email);
}

export function getProfileByUserId(userId: string): UserProfile | undefined {
  return mockProfiles.find((p) => p.userId === userId);
}

export function createUser(userData: Partial<User> & { email: string }): User {
  const user: User = {
    id: `user_${Date.now()}`,
    email: userData.email,
    role: userData.role || 'member',
    permissions: userData.permissions || ['read', 'write'],
    onboardingCompleted: userData.onboardingCompleted || false,
    trustScore: userData.trustScore,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockUsers.push(user);
  return user;
}
