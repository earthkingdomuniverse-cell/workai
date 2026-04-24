/**
 * Factory Exports
 * Task 2.1: Test Data Factory Pattern
 * 
 * Central export for all test factories
 */

// Base
export { 
  Factory, 
  defineFactory, 
  faker, 
  generateId, 
  generateTimestamp, 
  randomBool, 
  randomElement, 
  randomElements 
} from './base.factory';

// User
export { 
  userFactory, 
  candidateUserFactory, 
  employerUserFactory, 
  adminUserFactory, 
  pendingUserFactory, 
  inactiveUserFactory,
  TEST_USERS,
  type User 
} from './user.factory';

// Assessment
export { 
  assessmentFactory, 
  questionFactory,
  publishedAssessmentFactory, 
  draftAssessmentFactory, 
  technicalAssessmentFactory, 
  personalityAssessmentFactory,
  createAssessmentWithQuestions,
  type Assessment,
  type Question 
} from './assessment.factory';

// Result
export { 
  resultFactory, 
  answerFactory,
  passedResultFactory, 
  failedResultFactory, 
  inProgressResultFactory, 
  expiredResultFactory,
  createResultForUserAndAssessment,
  createResultsWithScoreDistribution,
  type AssessmentResult,
  type Answer 
} from './result.factory';
