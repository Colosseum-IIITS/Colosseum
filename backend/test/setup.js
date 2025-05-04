const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set Node environment to 'test'
process.env.NODE_ENV = 'test';

let mongoServer;

// Connect to the in-memory database before tests run
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear all test data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect and close the in-memory database after all tests are done
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test timeout
jest.setTimeout(30000);
