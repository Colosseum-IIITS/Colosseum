module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/test/**',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  moduleNameMapper: {
    '^backend/utils/redisClient': '<rootDir>/backend/utils/__mocks__/redisClient.js'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/frontend/',
    '<rootDir>/frontend/.next/'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/frontend/'
  ],
  setupFiles: [
    '<rootDir>/jest.setup.js'
  ],
  // Run all tests
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  // For GitHub workflows
  clearMocks: true,
  bail: true, // Exit immediately on first error
  verbose: true,
  collectCoverage: false,
  testTimeout: 30000,
  maxWorkers: process.env.CI ? 2 : '50%' // Limit workers in CI environment
};
