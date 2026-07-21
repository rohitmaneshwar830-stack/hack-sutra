const mongoose = require('mongoose');

const digitalTwinSimulationSchema = new mongoose.Schema({
  scenario: {
    type: String,
    default: 'Custom Policy Simulation',
  },
  interventions: {
    type: [String],
    default: [],
  },
  beforeValues: {
    bodLevel: { type: Number, default: 61 },
    fishKillRisk: { type: Number, default: 70 },
    dolphinHabitatRisk: { type: String, default: 'HIGH RISK' },
  },
  afterValues: {
    bodLevel: { type: Number, required: true },
    fishKillRisk: { type: Number, required: true },
    dolphinHabitatRisk: { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DigitalTwinSimulation', digitalTwinSimulationSchema);
