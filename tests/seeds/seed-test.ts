/**
 * Test Database Seeding
 * Task 2.2: Database Seeding Scripts
 * 
 * Minimal seed for integration tests
 */

import { PrismaClient } from '@prisma/client';
import { TEST_USERS } from '../factories';

const prisma = new PrismaClient();

/**
 * Seed minimal test data
 */
export async function seedTestDatabase(): Promise<void> {
  console.log('🌱 Seeding test database...');

  // Create test users
  const users = [
    {
      id: 'test-candidate',
      email: TEST_USERS.candidate.email,
      password: '$2b$10$YourHashedPasswordHere', // bcrypt hash
      firstName: TEST_USERS.candidate.firstName,
      lastName: TEST_USERS.candidate.lastName,
      role: 'candidate',
      status: 'active',
    },
    {
      id: 'test-admin',
      email: TEST_USERS.admin.email,
      password: '$2b$10$YourHashedPasswordHere',
      firstName: TEST_USERS.admin.firstName,
      lastName: TEST_USERS.admin.lastName,
      role: 'admin',
      status: 'active',
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData as any,
    });
    console.log(`  ✓ Created test user: ${userData.email}`);
  }

  console.log('✅ Test database seeded');
}

/**
 * Reset test database
 */
export async function resetTestDatabase(): Promise<void> {
  console.log('🗑️  Resetting test database...');

  // Delete all data
  await prisma.answer.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Test database reset');
}

// Run if called directly
if (require.main === module) {
  seedTestDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
