const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required.');

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });

  return conn;
};

module.exports = connectDB;
