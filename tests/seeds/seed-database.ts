/**
 * Database Seeding Script
 * Task 2.2: Database Seeding Scripts
 * 
 * Seeds database with test data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import {
  userFactory,
  candidateUserFactory,
  employerUserFactory,
  adminUserFactory,
  assessmentFactory,
  publishedAssessmentFactory,
  draftAssessmentFactory,
  resultFactory,
  passedResultFactory,
  failedResultFactory,
  TEST_USERS,
} from '../factories';

const prisma = new PrismaClient();

/**
 * Seed Users
 */
async function seedUsers(): Promise<string[]> {
  console.log('🌱 Seeding users...');

  const userIds: string[] = [];

  // Seed standard test users
  const standardUsers = [
    { ...TEST_USERS.candidate, id: 'user-candidate-free' },
    { ...TEST_USERS.candidatePremium, id: 'user-candidate-premium' },
    { ...TEST_USERS.employer, id: 'user-employer-basic' },
    { ...TEST_USERS.admin, id: 'user-admin' },
    { ...TEST_USERS.superAdmin, id: 'user-super-admin' },
  ];

  for (const userData of standardUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        id: userData.id,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        status: 'active',
        emailVerifiedAt: new Date(),
      },
    });
    userIds.push(user.id);
    console.log(`  ✓ Created user: ${user.email} (${user.role})`);
  }

  // Seed random users
  const randomUsers = userFactory.createMany(20);
  for (const userData of randomUsers) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        emailVerifiedAt: faker.datatype.boolean() ? new Date() : null,
      },
    });
    userIds.push(user.id);
  }

  console.log(`✅ Seeded ${userIds.length} users`);
  return userIds;
}

/**
 * Seed Assessments
 */
async function seedAssessments(userIds: string[]): Promise<string[]> {
  console.log('🌱 Seeding assessments...');

  const assessmentIds: string[] = [];
  const creatorId = userIds[0]; // Use first user as creator

  // Seed published assessments
  const publishedAssessments = publishedAssessmentFactory.createMany(10);
  for (const assessmentData of publishedAssessments) {
    const assessment = await prisma.assessment.create({
      data: {
        id: assessmentData.id,
        title: assessmentData.title,
        description: assessmentData.description,
        type: assessmentData.type,
        status: 'published',
        difficulty: assessmentData.difficulty,
        category: assessmentData.category,
        tags: assessmentData.tags,
        duration: assessmentData.duration,
        totalQuestions: assessmentData.totalQuestions,
        passingScore: assessmentData.passingScore,
        createdBy: creatorId,
        isPublic: assessmentData.isPublic,
        allowRetake: assessmentData.allowRetake,
        showResults: assessmentData.showResults,
        shuffleQuestions: assessmentData.shuffleQuestions,
        proctoringEnabled: assessmentData.proctoringEnabled,
        aiEnabled: assessmentData.aiEnabled,
        questions: {
          create: assessmentData.questions.map((q) => ({
            id: q.id,
            type: q.type,
            text: q.text,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            points: q.points,
            timeLimit: q.timeLimit,
            order: q.order,
          })),
        },
      },
    });
    assessmentIds.push(assessment.id);
  }

  // Seed draft assessments
  const draftAssessments = draftAssessmentFactory.createMany(5);
  for (const assessmentData of draftAssessments) {
    const assessment = await prisma.assessment.create({
      data: {
        id: assessmentData.id,
        title: assessmentData.title,
        description: assessmentData.description,
        type: assessmentData.type,
        status: 'draft',
        difficulty: assessmentData.difficulty,
        category: assessmentData.category,
        tags: assessmentData.tags,
        duration: assessmentData.duration,
        totalQuestions: assessmentData.totalQuestions,
        passingScore: assessmentData.passingScore,
        createdBy: creatorId,
        isPublic: false,
        questions: {
          create: assessmentData.questions.map((q) => ({
            id: q.id,
            type: q.type,
            text: q.text,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            points: q.points,
            order: q.order,
          })),
        },
      },
    });
    assessmentIds.push(assessment.id);
  }

  console.log(`✅ Seeded ${assessmentIds.length} assessments`);
  return assessmentIds;
}

/**
 * Seed Results
 */
async function seedResults(
  userIds: string[],
  assessmentIds: string[]
): Promise<void> {
  console.log('🌱 Seeding results...');

  const results = [
    ...passedResultFactory.createMany(15),
    ...failedResultFactory.createMany(10),
  ];

  for (const resultData of results) {
    const userId = faker.helpers.arrayElement(userIds);
    const assessmentId = faker.helpers.arrayElement(assessmentIds);

    await prisma.assessmentResult.create({
      data: {
        id: resultData.id,
        assessmentId: assessmentId,
        userId: userId,
        status: resultData.status,
        startedAt: resultData.startedAt,
        completedAt: resultData.completedAt,
        submittedAt: resultData.submittedAt,
        timeSpent: resultData.timeSpent,
        totalScore: resultData.totalScore,
        maxScore: resultData.maxScore,
        percentage: resultData.percentage,
        passed: resultData.passed,
        feedback: resultData.feedback,
        aiAnalysis: resultData.aiAnalysis,
        ipAddress: resultData.ipAddress,
        userAgent: resultData.userAgent,
        answers: {
          create: resultData.answers.map((a) => ({
            questionId: a.questionId,
            selectedOption: a.selectedOption,
            timeSpent: a.timeSpent,
            answeredAt: a.answeredAt,
            isCorrect: a.isCorrect,
            score: a.score,
          })),
        },
      },
    });
  }

  console.log(`✅ Seeded ${results.length} results`);
}

/**
 * Seed Organizations
 */
async function seedOrganizations(userIds: string[]): Promise<void> {
  console.log('🌱 Seeding organizations...');

  const organizations = [
    { name: 'Tech Corp', domain: 'techcorp.com' },
    { name: 'Startup Inc', domain: 'startup.io' },
    { name: 'Enterprise Ltd', domain: 'enterprise.com' },
  ];

  for (const orgData of organizations) {
    const org = await prisma.organization.create({
      data: {
        id: faker.string.uuid(),
        name: orgData.name,
        domain: orgData.domain,
        status: 'active',
        plan: faker.helpers.arrayElement(['free', 'basic', 'pro', 'enterprise']),
        maxUsers: faker.helpers.arrayElement([10, 50, 100, 500]),
        maxAssessments: faker.helpers.arrayElement([10, 50, 100, -1]),
      },
    });

    // Assign users to organization
    const numMembers = faker.number.int({ min: 2, max: 5 });
    const memberIds = faker.helpers.arrayElements(userIds, numMembers);

    for (const memberId of memberIds) {
      await prisma.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: memberId,
          role: faker.helpers.arrayElement(['member', 'admin', 'owner']),
          status: 'active',
        },
      });
    }

    console.log(`  ✓ Created organization: ${org.name}`);
  }

  console.log('✅ Seeded organizations');
}

/**
 * Clear existing data
 */
async function clearDatabase(): Promise<void> {
  console.log('🗑️  Clearing existing data...');

  const tables = [
    'Answer',
    'AssessmentResult',
    'Question',
    'Assessment',
    'OrganizationMember',
    'Organization',
    'User',
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
  }

  console.log('✅ Database cleared');
}

/**
 * Main seed function
 */
async function main(): Promise<void> {
  const environment = process.env.NODE_ENV || 'development';
  console.log(`🚀 Seeding database for ${environment}`);
  console.log('=' .repeat(50));

  try {
    // Clear existing data in test/dev
    if (environment !== 'production') {
      await clearDatabase();
    }

    // Seed in order
    const userIds = await seedUsers();
    const assessmentIds = await seedAssessments(userIds);
    await seedResults(userIds, assessmentIds);
    await seedOrganizations(userIds);

    console.log('=' .repeat(50));
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as seedDatabase };
