# Colosseum Testing Documentation

This document outlines the testing approach and implementation for the Colosseum E-Sports Tournament Hosting Platform. The testing suite is designed to ensure code reliability, maintainability, and to verify that all components function as expected.

## Testing Architecture

### Technology Stack

- **Jest**: Primary testing framework
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for test isolation
- **Mocking Libraries**: For external dependencies (Stripe, Nodemailer, etc.)

### Directory Structure

```
backend/
├── controllers/
│   ├── __tests__/             # Controller tests
│   │   ├── adminController.test.js
│   │   ├── authController.test.js
│   │   ├── organiserController.test.js
│   │   ├── paymentController.test.js
│   │   ├── playerController.test.js
│   │   ├── teamController.test.js
│   │   └── tournamentController.test.js
├── test/
│   ├── setup.js               # Global test configuration
│   └── testUtils.js           # Testing utilities and helpers
```

## Testing Methodology

### Test Isolation

All tests run with:
- Isolated in-memory MongoDB database that's reset between tests
- Mocked external services to avoid network calls
- Independent test execution to prevent test interdependencies

### Test Structure

Each test file follows a consistent pattern:

1. **Setup**: Import dependencies, create Express app, register routes
2. **Mock Configuration**: Setup mocks for authentication, external APIs
3. **Test Suites**: Organized by feature using `describe` blocks
4. **Individual Tests**: Specific test cases using `it` blocks

### Authentication Testing

Tests for protected routes use mock authentication middleware that simulates user sessions without requiring actual JWT validation, allowing tests to:

- Test routes with different user roles (player, organiser, admin)
- Test authorization checks and permissions
- Simulate both authenticated and unauthenticated requests

## Testing Utilities

### Test Helpers

The `testUtils.js` file provides helper functions to:

- Create test users (players, organisers, admins) with appropriate data
- Generate authentication tokens for testing
- Create ObjectIDs for database relations
- Generate consistent test data

### Database Setup

The `setup.js` file handles:

- Creating and connecting to MongoDB Memory Server before tests
- Clearing all collections between tests
- Disconnecting and cleaning up after all tests complete

## Test Case Examples

### API Testing Pattern

Most API tests follow this pattern:

```javascript
it('should do something specific', async () => {
  // 1. Setup test data
  const testData = {...};
  
  // 2. Make API request with Supertest
  const response = await request(app)
    .post('/api/endpoint')
    .set('Authorization', 'Bearer token')
    .send(testData)
    .expect(200);
  
  // 3. Assert response properties
  expect(response.body).toHaveProperty('expectedProperty');
  
  // 4. Verify database changes (optional)
  const updatedRecord = await Model.findById(id);
  expect(updatedRecord.property).toBe(expectedValue);
});
```

### Mock Implementation

For external dependencies like payment processors:

```javascript
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'test_secret'
      })
    }
  }));
});
```

## Best Practices Implemented

1. **Descriptive Test Names**: Tests clearly state what functionality they verify
2. **Independent Tests**: Each test can run in isolation
3. **Test Coverage**: Critical paths and edge cases are covered
4. **Mock External Services**: Avoid actual API calls in tests
5. **Database Reset**: Clean database between tests
6. **Standardized Patterns**: Consistent testing approach across controllers

## Running Tests

Tests can be run using the following npm commands:

- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Generate test coverage report

## Test Coverage Areas

The testing suite covers:

- **Authentication**: Registration, login, token validation
- **Player Management**: Profile updates, tournament participation
- **Organiser Management**: Tournament creation, dashboard functionality
- **Admin Operations**: User management, system oversight
- **Tournament Workflows**: Creation, team registration, results
- **Team Management**: Team creation, joining tournaments
- **Payment Processing**: Tournament registration payments

## Troubleshooting Common Issues

- **MongoDB Connection Errors**: Ensure MongoDB Memory Server is properly configured
- **Mock Failures**: Verify that all external services are properly mocked
- **Test Isolation Issues**: Check for test interdependencies or missing cleanup
- **Authentication Issues**: Ensure mock authentication is properly implemented

---

This testing documentation was created as part of the software development course for the Colosseum E-Sports Tournament Hosting Platform project.
