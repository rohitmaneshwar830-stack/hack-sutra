const SensorReading = require('../models/SensorReading');

const getRecommendations = async (req, res) => {
  const { location } = req.params;
  const latestReading = await SensorReading.findOne({ location: { $regex: location, $options: 'i' } }).sort({ observedAt: -1 }).lean();
  if (!latestReading) return res.json({ availability: 'no_data', location, recommendations: [], source: null, observedAt: null, fetchedAt: new Date().toISOString() });

  const recommendations = [];
  if (latestReading.BOD > 30) recommendations.push({ id: 'aeration', priority: 1, action: 'Deploy emergency aerators', type: 'Remediation', cost: null, costBasis: 'Not configured', impact: 'High', time: 'Immediate', rationale: 'Observed BOD exceeds the configured critical threshold.' });
  if (latestReading.fecalColiform != null && latestReading.fecalColiform > 5000) recommendations.push({ id: 'public-health', priority: 2, action: 'Issue public bathing advisory', type: 'Public health', cost: null, costBasis: 'Not configured', impact: 'High', time: 'Immediate', rationale: 'Observed fecal coliform exceeds the configured threshold.' });
  if (latestReading.chromium != null && latestReading.chromium > 0.05) recommendations.push({ id: 'industrial-enforcement', priority: 3, action: 'Inspect upstream industrial discharge', type: 'Enforcement', cost: null, costBasis: 'Not configured', impact: 'High', time: 'Within 2 hours', rationale: 'Observed chromium exceeds the configured threshold.' });
  if (!recommendations.length) recommendations.push({ id: 'monitor', priority: 1, action: 'Continue routine monitoring', type: 'Monitoring', cost: null, costBasis: 'Not configured', impact: 'Measured data is below configured intervention thresholds', time: 'Ongoing', rationale: 'No configured threshold currently requires an intervention.' });
  res.json({ availability: 'available', location: latestReading.location, timestamp: latestReading.observedAt, source: latestReading.source, observedAt: latestReading.observedAt, fetchedAt: new Date().toISOString(), recommendations });
};

module.exports = { getRecommendations };
