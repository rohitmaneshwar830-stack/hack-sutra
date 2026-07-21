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
    default: 0,
  },
  fecalColiform: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
});

// Compound index for efficient time-series queries per location
sensorReadingSchema.index({ location: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
