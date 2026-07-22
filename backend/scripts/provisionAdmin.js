require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  if (!process.env.MONGO_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_NAME) throw new Error('MONGO_URI, ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD are required.');
  if (process.env.ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must contain at least 8 characters.');
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase().trim() });
  if (existing) throw new Error('An administrator with this email already exists.');
  await User.create({ name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, passwordHash: process.env.ADMIN_PASSWORD, role: 'admin' });
  await mongoose.disconnect();
  console.log('Administrator provisioned.');
};
run().catch(async (error) => { console.error(error.message); try { await mongoose.disconnect(); } catch {} process.exit(1); });
