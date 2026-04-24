/**
 * User Factory
 * Task 2.1: Test Data Factory Pattern
 * 
 * Creates test user data
 */

import { defineFactory, faker, generateId, generateTimestamp } from './base.factory';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'employer' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  avatarUrl?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  location?: string;
  timezone?: string;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const userFactory = defineFactory<User>(() => ({
  id: generateId('user'),
  email: faker.internet.email().toLowerCase(),
  password: 'Test@123456',
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: faker.helpers.arrayElement(['candidate', 'employer', 'admin']),
  status: 'active',
  avatarUrl: faker.image.avatar(),
  phone: faker.phone.number(),
  company: faker.company.name(),
  jobTitle: faker.person.jobTitle(),
  location: faker.location.city(),
  timezone: faker.location.timeZone(),
  lastLoginAt: generateTimestamp(),
  emailVerifiedAt: generateTimestamp(),
  createdAt: generateTimestamp(),
  updatedAt: generateTimestamp(),
}));

/**
 * Pre-defined user factories for common scenarios
 */

export const candidateUserFactory = defineFactory<User>(() =>
  userFactory.build({
    role: 'candidate',
    status: 'active',
  })
);

export const employerUserFactory = defineFactory<User>(() =>
  userFactory.build({
    role: 'employer',
    status: 'active',
  })
);

export const adminUserFactory = defineFactory<User>(() =>
  userFactory.build({
    role: 'admin',
    status: 'active',
  })
);

export const pendingUserFactory = defineFactory<User>(() =>
  userFactory.build({
    role: 'candidate',
    status: 'pending',
    emailVerifiedAt: undefined,
  })
);

export const inactiveUserFactory = defineFactory<User>(() =>
  userFactory.build({
    status: 'inactive',
  })
);

/**
 * Test user constants
 */
export const TEST_USERS = {
  candidate: {
    email: 'candidate_free@example.com',
    password: 'Test@123456',
    firstName: 'Test',
    lastName: 'Candidate',
    role: 'candidate',
  },
  candidatePremium: {
    email: 'candidate_premium@example.com',
    password: 'Test@123456',
    firstName: 'Premium',
    lastName: 'Candidate',
    role: 'candidate',
  },
  employer: {
    email: 'employer_basic@example.com',
    password: 'Test@123456',
    firstName: 'Test',
    lastName: 'Employer',
    role: 'employer',
  },
  admin: {
    email: 'admin@example.com',
    password: 'Admin@Secure789',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  superAdmin: {
    email: 'super_admin@example.com',
    password: 'Admin@Secure789',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
  },
} as const;
