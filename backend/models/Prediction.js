const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    index: true,
  },
  forecastDays: [
    {
      day: { type: String, required: true },
      bodValue: { type: Number, required: true },
      status: { type: String, required: true },
    },
  ],
  modelVersion: {
    type: String,
    default: 'v1.0-ridge',
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prediction', predictionSchema);
