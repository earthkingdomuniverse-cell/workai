/**
 * Mock Data Generator
 * Task 2.3: Mock Data Generator
 * 
 * Generates consistent mock data for tests and development
 */

import { faker } from '@faker-js/faker';

/**
 * Mock User Generator
 */
export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  role: string;
  status: string;
  createdAt: string;
}

export function generateMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: `user_${faker.string.nanoid(10)}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    avatar: faker.image.avatar(),
    role: faker.helpers.arrayElement(['candidate', 'employer', 'admin']),
    status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

export function generateMockUsers(count: number): MockUser[] {
  return Array.from({ length: count }, () => generateMockUser());
}

/**
 * Mock Assessment Generator
 */
export interface MockAssessment {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'draft' | 'published' | 'archived';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  createdBy: string;
  createdAt: string;
}

export function generateMockAssessment(
  overrides: Partial<MockAssessment> = {}
): MockAssessment {
  const titles = [
    'JavaScript Fundamentals',
    'React Advanced Patterns',
    'Node.js API Development',
    'System Design Interview',
    'Data Structures',
    'SQL Mastery',
    'CSS & Styling',
    'TypeScript Basics',
  ];

  return {
    id: `assessment_${faker.string.nanoid(10)}`,
    title: faker.helpers.arrayElement(titles),
    description: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(['technical', 'behavioral', 'cognitive']),
    status: faker.helpers.arrayElement(['draft', 'published', 'archived']),
    difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
    category: faker.helpers.arrayElement(['Frontend', 'Backend', 'DevOps', 'Mobile']),
    duration: faker.number.int({ min: 15, max: 120 }),
    totalQuestions: faker.number.int({ min: 5, max: 50 }),
    passingScore: 70,
    createdBy: `user_${faker.string.nanoid(10)}`,
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

export function generateMockAssessments(count: number): MockAssessment[] {
  return Array.from({ length: count }, () => generateMockAssessment());
}

/**
 * Mock Question Generator
 */
export interface MockQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text' | 'code';
  options?: string[];
  correctAnswer?: string;
  points: number;
  timeLimit: number;
}

export function generateMockQuestion(
  type: 'multiple_choice' | 'text' | 'code' = 'multiple_choice'
): MockQuestion {
  const base = {
    id: `question_${faker.string.nanoid(10)}`,
    text: faker.lorem.sentence() + '?',
    type,
    points: faker.number.int({ min: 1, max: 10 }),
    timeLimit: faker.number.int({ min: 30, max: 300 }),
  };

  if (type === 'multiple_choice') {
    return {
      ...base,
      options: ['A', 'B', 'C', 'D'].map(() => faker.lorem.words(2)),
      correctAnswer: 'A',
    };
  }

  return base;
}

export function generateMockQuestions(count: number): MockQuestion[] {
  return Array.from({ length: count }, () =>
    generateMockQuestion(faker.helpers.arrayElement(['multiple_choice', 'text', 'code']))
  );
}

/**
 * Mock Result Generator
 */
export interface MockResult {
  id: string;
  assessmentId: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'graded';
  startedAt: string;
  completedAt?: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
}

export function generateMockResult(
  overrides: Partial<MockResult> = {}
): MockResult {
  const maxScore = 100;
  const totalScore = faker.number.int({ min: 0, max: maxScore });
  const percentage = Math.round((totalScore / maxScore) * 100);

  return {
    id: `result_${faker.string.nanoid(10)}`,
    assessmentId: `assessment_${faker.string.nanoid(10)}`,
    userId: `user_${faker.string.nanoid(10)}`,
    status: faker.helpers.arrayElement(['in_progress', 'completed', 'graded']),
    startedAt: faker.date.recent().toISOString(),
    completedAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined,
    totalScore,
    maxScore,
    percentage,
    passed: percentage >= 70,
    timeSpent: faker.number.int({ min: 10, max: 120 }),
    ...overrides,
  };
}

export function generateMockResults(count: number): MockResult[] {
  return Array.from({ length: count }, () => generateMockResult());
}

/**
 * Mock API Response Generator
 */
export interface MockApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function generateMockApiResponse<T>(
  data: T,
  meta?: MockApiResponse<T>['meta']
): MockApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

export function generateMockApiError(
  message: string,
  code: string = 'ERROR'
): { success: false; error: { code: string; message: string } } {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

/**
 * Mock Pagination
 */
export interface MockPagination<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function generateMockPagination<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): MockPagination<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: items.slice(start, end),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Export all generators
 */
export const MockData = {
  user: generateMockUser,
  users: generateMockUsers,
  assessment: generateMockAssessment,
  assessments: generateMockAssessments,
  question: generateMockQuestion,
  questions: generateMockQuestions,
  result: generateMockResult,
  results: generateMockResults,
  apiResponse: generateMockApiResponse,
  apiError: generateMockApiError,
  paginate: generateMockPagination,
};

export default MockData;
