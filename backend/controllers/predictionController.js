const axios = require('axios');
const Prediction = require('../models/Prediction');
const SensorReading = require('../models/SensorReading');

const getPrediction = async (req, res) => {
  const { location } = req.params;
  const cached = await Prediction.findOne({ location: { $regex: location, $options: 'i' }, generatedAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } }).sort({ generatedAt: -1 }).lean();
  if (cached) return res.json({ ...cached, availability: 'available', stale: false, source: cached.source, observedAt: cached.generatedAt, fetchedAt: new Date().toISOString() });

  const readings = await SensorReading.find({ location: { $regex: location, $options: 'i' } }).sort({ observedAt: -1 }).limit(14).lean();
  if (readings.length < 5) return res.json({ availability: 'insufficient_data', location, forecastDays: [], message: 'At least five observations are required for a five-day forecast.' });
  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, { location: readings[0].location, bod_readings: readings.map((reading) => reading.BOD).reverse(), do_readings: readings.map((reading) => reading.DO).reverse() }, { timeout: 10000 });
    const prediction = await Prediction.create({ location: readings[0].location, forecastDays: response.data.forecast, modelVersion: response.data.model || 'unknown', source: 'ml-service', confidence: response.data.confidence ?? null, generatedAt: new Date() });
    return res.json({ ...prediction.toObject(), availability: 'available', stale: false, observedAt: readings[0].observedAt, fetchedAt: new Date().toISOString() });
  } catch {
    const lastValid = await Prediction.findOne({ location: { $regex: location, $options: 'i' } }).sort({ generatedAt: -1 }).lean();
    if (lastValid) return res.json({ ...lastValid, availability: 'available', stale: true, message: 'Showing the last valid prediction while the model service recovers.' });
    return res.status(503).json({ error: { code: 'ML_UNAVAILABLE', message: 'Prediction model is temporarily unavailable.' } });
  }
};

module.exports = { getPrediction };
