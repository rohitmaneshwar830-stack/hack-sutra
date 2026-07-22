require('dotenv').config();
const mongoose = require('mongoose');
const models = [require('../models/User'), require('../models/SensorReading'), require('../models/Station'), require('../models/Industry'), require('../models/RiverStretch'), require('../models/DataSyncRun'), require('../models/IndustryCompliance')];

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  await mongoose.connect(process.env.MONGO_URI);
  for (const model of models) await model.createIndexes();
  await mongoose.disconnect();
  console.log(`Created indexes for ${models.length} models.`);
};
run().catch(async (error) => { console.error(error.message); try { await mongoose.disconnect(); } catch {} process.exit(1); });
