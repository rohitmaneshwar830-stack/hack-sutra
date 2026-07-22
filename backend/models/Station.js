const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, index: true },
  coordinates: { type: [Number], required: true },
  provider: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  externalId: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

stationSchema.index({ coordinates: '2dsphere' });
stationSchema.index({ provider: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model('Station', stationSchema);
