/**
 * User Test Fixtures
 * Task 1.2: Unit Test Directory Structure
 */

import { User } from '@/types/user';

export const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'candidate',
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAdmin: User = {
  id: 'admin-456',
  email: 'admin@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'admin',
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockUsers: User[] = [
  mockUser,
  mockAdmin,
  {
    id: 'user-789',
    email: 'employer@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: 'employer',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];
