const mongoose = require('mongoose');

const speciesAlertSchema = new mongoose.Schema({
  speciesName: {
    type: String,
    required: true,
  },
  scientificName: {
    type: String,
    default: '',
  },
  conservationStatus: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  habitat: {
    type: String,
    default: '',
  },
  threats: {
    type: String,
    default: '',
  },
  population: {
    type: String,
    default: '',
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'ALERT'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SpeciesAlert', speciesAlertSchema);
