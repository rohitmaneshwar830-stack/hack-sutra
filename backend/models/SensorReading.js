const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    index: true,
  },
  BOD: {
    type: Number,
    required: true,
  },
  DO: {
    type: Number,
    required: true,
  },
  pH: {
    type: Number,
    required: true,
  },
  turbidity: {
    type: Number,
    required: true,
  },
  heavyMetals: {
    type: Number,
    default: null,
  },
  chromium: { type: Number, min: 0, default: null },
  lead: { type: Number, min: 0, default: null },
  mercury: { type: Number, min: 0, default: null },
  fecalColiform: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  source: { type: String, required: true, default: 'unknown' },
  sourceUrl: { type: String, default: '' },
  observedAt: { type: Date, required: true },
});

// Compound index for efficient time-series queries per location
sensorReadingSchema.index({ location: 1, observedAt: -1, timestamp: -1 });
sensorReadingSchema.index({ source: 1, observedAt: -1 });
// Unique constraint to prevent duplicate readings from the same source at the same time/location.
// This backs the bulkWrite upsert deduplication in dataSyncService.js.
sensorReadingSchema.index({ location: 1, observedAt: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
