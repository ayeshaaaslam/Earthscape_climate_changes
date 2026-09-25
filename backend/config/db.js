const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/earthscape';
  
  try {
    // Attempt standard MongoDB connection
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected to external MongoDB at: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.warn(`[Database] Standard MongoDB at ${mongoUri} unavailable (${err.message}).`);
    console.log(`[Database] Initializing isolated development MongoDB Memory Server fallback...`);
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServerInstance = await MongoMemoryServer.create({
      instance: { launchTimeoutMS: 60000 }
    });
    const fallbackUri = mongoServerInstance.getUri();
    await mongoose.connect(fallbackUri);
    console.log(`[Database] Connected to high-performance In-Memory MongoDB Engine (${fallbackUri})`);
  } catch (memErr) {
    console.error(`[Database] Fatal database connection error: ${memErr.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
