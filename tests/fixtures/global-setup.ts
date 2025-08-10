import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalSetup() {
  console.log('🌱 Setting up test database with seed data...');
  
  try {
    // Ensure database is reset and seeded with deterministic data
    // This ensures we have seed-user-1 with STK110 module and test data
    await execAsync('npm run seed:bit');
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    // Don't fail the tests if seed fails - the pretest:e2e should handle this
    console.log('ℹ️  Continuing with existing database state...');
  }
}

export default globalSetup;
