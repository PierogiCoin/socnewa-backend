# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the backend API including:
- Unit tests for business logic
- Integration tests for API endpoints
- Rate limiting tests
- Error handling tests

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual modules
│   ├── contentScoring.test.ts
│   └── contentTemplates.test.ts
├── integration/             # Integration tests for API endpoints
│   ├── api.test.ts
│   ├── rateLimiting.test.ts
│   └── errorHandling.test.ts
├── helpers/                 # Test utilities and helpers
│   └── testApp.ts
├── setup.ts                 # Global test setup
└── README.md               # This file
```

## Test Categories

### Unit Tests

Test individual functions and modules in isolation:
- `contentScoring.test.ts` - Tests content validation and scoring logic
- `contentTemplates.test.ts` - Tests template retrieval and filtering

### Integration Tests

Test API endpoints and their interactions:
- `api.test.ts` - Tests health check, templates, and content scoring endpoints
- `rateLimiting.test.ts` - Tests rate limiting behavior for different user tiers
- `errorHandling.test.ts` - Tests error handling middleware and custom errors

## Test Coverage

To generate and view coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../myModule';

describe('myModule', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp';

const app = createTestApp();

describe('API Tests', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/api/endpoint');
    expect(response.status).toBe(200);
  });
});
```

## Environment Variables

Test environment variables are set in `tests/setup.ts`. For custom test configuration, create a `.env.test` file:

```env
GOOGLE_API_KEY=test-key
SUPABASE_URL=https://test.supabase.co
SUPABASE_SERVICE_KEY=test-service-key
NODE_ENV=test
```

## CI/CD Integration

These tests can be easily integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
  
- name: Generate coverage
  run: npm run test:coverage
```

## Best Practices

1. **Keep tests isolated** - Each test should be independent
2. **Use descriptive names** - Test names should clearly describe what they test
3. **Test edge cases** - Include tests for error conditions and edge cases
4. **Mock external services** - Don't make real API calls in tests
5. **Maintain fast tests** - Keep test execution time low for better developer experience
