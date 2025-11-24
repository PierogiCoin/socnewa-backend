import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default test environment variables if not set
process.env.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'test-api-key';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';
process.env.NODE_ENV = 'test';

beforeAll(() => {
  console.log('🧪 Test setup complete');
});

afterAll(() => {
  console.log('✅ All tests completed');
});
