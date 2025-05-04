module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  testTimeout: 60000, // Increase global timeout to 60 seconds
  verbose: true,
  setupFilesAfterEnv: ['./test/setup.js'],
  // Only use forceExit as a fallback if open handles still exist
  forceExit: false,
  // Set NODE_ENV to 'test' during tests
  testEnvironmentOptions: {
    env: { NODE_ENV: 'test' }
  }
};
