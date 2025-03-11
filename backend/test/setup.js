const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Declare a variable for the in-memory server
let mongoServer;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Disconnect from the in-memory database and stop the server
  await mongoose.disconnect();
  await mongoServer.stop();
});
