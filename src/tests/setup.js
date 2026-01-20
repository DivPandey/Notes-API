const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests - increased timeout for first-time MongoDB download
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Set environment variables for tests
    process.env.NODE_ENV = 'test';
    process.env.API_KEY_PREFIX = 'napi_';

    await mongoose.connect(mongoUri);
}, 120000); // 120 second timeout for initial MongoDB binary download

// Cleanup after all tests
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
}, 30000);

// Clear collections between tests
afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
});
