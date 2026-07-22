const axios = require('axios');
const SensorReading = require('../models/SensorReading');
const Industry = require('../models/Industry');

const analyzeRootCause = async (req, res) => {
  const { location, chromium, lead, mercury, bod, do: doValue, turbidity, coordinates } = req.body;
  let input = { location, chromium, lead, mercury, bod, do: doValue, turbidity };
  if ([chromium, lead, mercury, bod, doValue, turbidity].some((value) => value === undefined || value === null)) {
    const latest = await SensorReading.findOne({ location: { $regex: location || '', $options: 'i' } }).sort({ observedAt: -1 }).lean();
    if (!latest || [latest.chromium, latest.lead, latest.mercury, latest.BOD, latest.DO, latest.turbidity].some((value) => value === undefined || value === null)) {
      return res.json({ availability: 'insufficient_data', location, analysis: null, nearbyIndustries: [], message: 'Complete pollutant measurements are required for root-cause analysis.' });
    }
    input = { location: latest.location, chromium: latest.chromium, lead: latest.lead, mercury: latest.mercury, bod: latest.BOD, do: latest.DO, turbidity: latest.turbidity };
  }

  let analysis;
  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/classify-source`, input, { timeout: 10000 });
    analysis = response.data;
  } catch {
    return res.status(503).json({ error: { code: 'ML_UNAVAILABLE', message: 'Root-cause model is temporarily unavailable.' } });
  }

  let nearbyIndustries = [];
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    nearbyIndustries = await Industry.find({ active: true, coordinates: { $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: 25000 } } }).limit(10).lean();
  }
  res.json({ availability: 'available', location: input.location, analysis, nearbyIndustries, source: 'ml-service', observedAt: new Date().toISOString(), fetchedAt: new Date().toISOString() });
};

module.exports = { analyzeRootCause };
