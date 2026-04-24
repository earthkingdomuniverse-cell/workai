/**
 * Development Database Seeding
 * Task 2.2: Database Seeding Scripts
 * 
 * Rich seed data for development environment
 */

import { seedDatabase } from './seed-database';

/**
 * Development seed with sample data
 */
async function seedDevelopment(): Promise<void> {
  console.log('🚀 Seeding development database...');
  
  // Set development environment
  process.env.NODE_ENV = 'development';
  
  await seedDatabase();
  
  console.log('🎉 Development database ready!');
  console.log('');
  console.log('Test Accounts:');
  console.log('  Candidate: candidate_free@example.com / Test@123456');
  console.log('  Admin:     admin@example.com / Admin@Secure789');
}

// Run if called directly
if (require.main === module) {
  seedDevelopment()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { seedDevelopment };
