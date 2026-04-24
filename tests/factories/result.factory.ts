/**
 * Result Factory
 * Task 2.1: Test Data Factory Pattern
 * 
 * Creates test assessment result data
 */

import { defineFactory, faker, generateId, generateTimestamp } from './base.factory';
import { userFactory, User } from './user.factory';
import { assessmentFactory, Assessment, Question } from './assessment.factory';

export interface Answer {
  questionId: string;
  selectedOption?: string;
  textAnswer?: string;
  codeAnswer?: string;
  fileUrl?: string;
  timeSpent: number; // seconds
  answeredAt: Date;
  isCorrect?: boolean;
  score: number;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'graded' | 'expired';
  startedAt: Date;
  completedAt?: Date;
  submittedAt?: Date;
  timeSpent: number; // minutes
  answers: Answer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  feedback?: string;
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    skillGaps: string[];
    overallRating: number;
  };
  proctoringFlags?: string[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const answerFactory = defineFactory<Answer>(() => ({
  questionId: generateId('question'),
  selectedOption: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
  timeSpent: faker.number.int({ min: 10, max: 300 }),
  answeredAt: generateTimestamp(),
  isCorrect: faker.datatype.boolean(),
  score: faker.number.int({ min: 0, max: 10 }),
}));

export const resultFactory = defineFactory<AssessmentResult>(() => {
  const answerCount = faker.number.int({ min: 5, max: 20 });
  const answers = Array.from({ length: answerCount }, () => answerFactory.build());
  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  const maxScore = answerCount * 10;
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return {
    id: generateId('result'),
    assessmentId: generateId('assessment'),
    userId: generateId('user'),
    status: faker.helpers.arrayElement(['in_progress', 'completed', 'graded']),
    startedAt: generateTimestamp(),
    completedAt: faker.datatype.boolean() ? generateTimestamp() : undefined,
    submittedAt: faker.datatype.boolean() ? generateTimestamp() : undefined,
    timeSpent: faker.number.int({ min: 15, max: 120 }),
    answers,
    totalScore,
    maxScore,
    percentage,
    passed: percentage >= 70,
    feedback: faker.datatype.boolean() ? faker.lorem.paragraph() : undefined,
    aiAnalysis: faker.datatype.boolean() ? {
      strengths: faker.helpers.arrayElements(['Problem Solving', 'Communication', 'Technical Skills', 'Creativity'], 2),
      weaknesses: faker.helpers.arrayElements(['Time Management', 'Documentation', 'Testing'], 1),
      recommendations: faker.helpers.arrayElements(['Practice more', 'Take advanced course'], 1),
      skillGaps: faker.helpers.arrayElements(['React Hooks', 'Database Design', 'API Design'], 2),
      overallRating: faker.number.int({ min: 1, max: 5 }),
    } : undefined,
    proctoringFlags: [],
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    createdAt: generateTimestamp(),
    updatedAt: generateTimestamp(),
  };
});

/**
 * Pre-defined result factories
 */

export const passedResultFactory = defineFactory<AssessmentResult>(() =>
  resultFactory.build({
    status: 'graded',
    percentage: faker.number.int({ min: 70, max: 100 }),
    passed: true,
  })
);

export const failedResultFactory = defineFactory<AssessmentResult>(() =>
  resultFactory.build({
    status: 'graded',
    percentage: faker.number.int({ min: 0, max: 69 }),
    passed: false,
  })
);

export const inProgressResultFactory = defineFactory<AssessmentResult>(() =>
  resultFactory.build({
    status: 'in_progress',
    completedAt: undefined,
    submittedAt: undefined,
  })
);

export const expiredResultFactory = defineFactory<AssessmentResult>(() =>
  resultFactory.build({
    status: 'expired',
  })
);

/**
 * Create result for specific user and assessment
 */
export function createResultForUserAndAssessment(
  user: Partial<User>,
  assessment: Partial<Assessment>,
  overrides: Partial<AssessmentResult> = {}
): AssessmentResult {
  return resultFactory.build({
    userId: user.id || generateId('user'),
    assessmentId: assessment.id || generateId('assessment'),
    ...overrides,
  });
}

/**
 * Create results with specific score distribution
 */
export function createResultsWithScoreDistribution(
  count: number,
  minScore: number,
  maxScore: number
): AssessmentResult[] {
  return Array.from({ length: count }, () => {
    const percentage = faker.number.int({ min: minScore, max: maxScore });
    return resultFactory.build({
      percentage,
      passed: percentage >= 70,
    });
  });
}
