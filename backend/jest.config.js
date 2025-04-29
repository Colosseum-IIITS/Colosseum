module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  testTimeout: 60000, // Increase global timeout to 60 seconds
  verbose: true,
  setupFilesAfterEnv: ['./backend/test/setup.js'],
};
