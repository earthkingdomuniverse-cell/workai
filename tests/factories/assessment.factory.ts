/**
 * Assessment Factory
 * Task 2.1: Test Data Factory Pattern
 * 
 * Creates test assessment data
 */

import { defineFactory, faker, generateId, generateTimestamp, randomElement } from './base.factory';
import { userFactory, User } from './user.factory';

export interface Question {
  id: string;
  type: 'multiple_choice' | 'text' | 'code' | 'video' | 'file';
  text: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  timeLimit?: number;
  order: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'skill' | 'personality' | 'cognitive' | 'technical' | 'custom';
  status: 'draft' | 'published' | 'archived';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  duration: number; // minutes
  totalQuestions: number;
  passingScore: number;
  questions: Question[];
  createdBy: string;
  organizationId?: string;
  isPublic: boolean;
  allowRetake: boolean;
  showResults: boolean;
  shuffleQuestions: boolean;
  proctoringEnabled: boolean;
  aiEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export const questionFactory = defineFactory<Question>(() => ({
  id: generateId('question'),
  type: 'multiple_choice',
  text: faker.lorem.sentence() + ' ?',
  options: [
    faker.lorem.word(),
    faker.lorem.word(),
    faker.lorem.word(),
    faker.lorem.word(),
  ],
  correctAnswer: 'A',
  points: faker.number.int({ min: 1, max: 10 }),
  timeLimit: faker.number.int({ min: 30, max: 300 }),
  order: 0,
}));

export const assessmentFactory = defineFactory<Assessment>(() => {
  const questionCount = faker.number.int({ min: 5, max: 20 });
  
  return {
    id: generateId('assessment'),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(['skill', 'personality', 'cognitive', 'technical', 'custom']),
    status: 'draft',
    difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
    category: faker.helpers.arrayElement(['JavaScript', 'Python', 'Design', 'Management', 'Soft Skills']),
    tags: faker.helpers.arrayElements(['frontend', 'backend', 'fullstack', 'junior', 'senior'], 2),
    duration: faker.number.int({ min: 15, max: 120 }),
    totalQuestions: questionCount,
    passingScore: 70,
    questions: Array.from({ length: questionCount }, (_, i) =>
      questionFactory.build({ order: i + 1 })
    ),
    createdBy: generateId('user'),
    organizationId: faker.datatype.boolean() ? generateId('org') : undefined,
    isPublic: faker.datatype.boolean(),
    allowRetake: faker.datatype.boolean(),
    showResults: true,
    shuffleQuestions: faker.datatype.boolean(),
    proctoringEnabled: faker.datatype.boolean(),
    aiEnabled: faker.datatype.boolean(),
    createdAt: generateTimestamp(),
    updatedAt: generateTimestamp(),
    expiresAt: faker.datatype.boolean() ? faker.date.future() : undefined,
  };
});

/**
 * Pre-defined assessment factories
 */

export const publishedAssessmentFactory = defineFactory<Assessment>(() =>
  assessmentFactory.build({
    status: 'published',
  })
);

export const draftAssessmentFactory = defineFactory<Assessment>(() =>
  assessmentFactory.build({
    status: 'draft',
  })
);

export const technicalAssessmentFactory = defineFactory<Assessment>(() =>
  assessmentFactory.build({
    type: 'technical',
    category: 'JavaScript',
    difficulty: 'medium',
  })
);

export const personalityAssessmentFactory = defineFactory<Assessment>(() =>
  assessmentFactory.build({
    type: 'personality',
    category: 'Soft Skills',
    difficulty: 'easy',
  })
);

/**
 * Create assessment with specific question types
 */
export function createAssessmentWithQuestions(
  questionTypes: Question['type'][],
  overrides: Partial<Assessment> = {}
): Assessment {
  const questions = questionTypes.map((type, index) =>
    questionFactory.build({
      type,
      order: index + 1,
      options: type === 'multiple_choice' ? 
        [faker.lorem.word(), faker.lorem.word(), faker.lorem.word(), faker.lorem.word()] : 
        undefined,
    })
  );

  return assessmentFactory.build({
    questions,
    totalQuestions: questions.length,
    ...overrides,
  });
}
