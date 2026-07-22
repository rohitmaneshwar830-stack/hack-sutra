const SensorReading = require('../models/SensorReading');
const PollutionReport = require('../models/PollutionReport');
const Alert = require('../models/Alert');
const Station = require('../models/Station');
const { getPagination, meta } = require('../utils/pagination');

const healthFromReading = (reading) => {
  const bodScore = Math.max(0, 30 - (reading.BOD / 30) * 30);
  const doScore = Math.min(30, (reading.DO / 6) * 30);
  const phScore = reading.pH >= 6.5 && reading.pH <= 8.5 ? 20 : Math.max(0, 20 - Math.abs(reading.pH - 7.5) * 5);
  const turbidityScore = Math.max(0, 20 - (reading.turbidity / 20) * 20);
  const healthScore = Math.round(Math.max(0, Math.min(100, bodScore + doScore + phScore + turbidityScore)));
  return { healthScore, status: healthScore >= 75 ? 'GOOD' : healthScore >= 50 ? 'MODERATE' : healthScore >= 30 ? 'POOR' : 'CRITICAL' };
};

const getStats = async (req, res) => {
  const [totalReports, activeAlerts, totalSensorReadings, pendingReports, monitoringLocations, latestReadings] = await Promise.all([
    PollutionReport.countDocuments(),
    Alert.countDocuments({ status: 'Active' }),
    SensorReading.countDocuments(),
    PollutionReport.countDocuments({ status: { $in: ['Under Review', 'Pending'] } }),
    Station.countDocuments({ active: true }),
    SensorReading.aggregate([
      { $sort: { observedAt: -1, timestamp: -1 } },
      { $group: { _id: '$location', latest: { $first: '$$ROOT' } } },
      { $replaceWith: '$latest' },
      { $limit: 100 },
    ]),
  ]);
  const locationData = latestReadings.map((reading) => ({
    _id: reading.location, latestBOD: reading.BOD, latestDO: reading.DO,
    latestpH: reading.pH, latestTurbidity: reading.turbidity,
    timestamp: reading.observedAt || reading.timestamp, source: reading.source, sourceUrl: reading.sourceUrl,
  }));
  const highestRisk = locationData.slice().sort((a, b) => b.latestBOD - a.latestBOD)[0] || null;
  res.json({
    availability: totalSensorReadings ? 'available' : 'no_data',
    source: 'MongoDB synchronized observations', observedAt: latestReadings[0]?.observedAt || null,
    fetchedAt: new Date().toISOString(), stale: false,
    totalReports, activeAlerts, totalSensorReadings, pendingReports, monitoringLocations,
    locationData, highestRiskLocation: highestRisk?._id || null,
    untreatedSewage: null, pollutingIndustries: null, historicBudget: null,
    alertLatency: activeAlerts ? null : null, latestTimestamp: latestReadings[0]?.observedAt || null,
  });
};

const getRiverHealth = async (req, res) => {
  const { location } = req.params;
  const reading = await SensorReading.findOne({ location: { $regex: location, $options: 'i' } }).sort({ observedAt: -1, timestamp: -1 }).lean();
  if (!reading) {
    return res.json({ availability: 'no_data', location, healthScore: null, status: 'NO_DATA', latestReading: null, source: null, observedAt: null, fetchedAt: new Date().toISOString(), stale: false });
  }
  const health = healthFromReading(reading);
  res.json({ availability: 'available', location: reading.location, ...health, source: reading.source, sourceUrl: reading.sourceUrl, observedAt: reading.observedAt || reading.timestamp, fetchedAt: new Date().toISOString(), stale: false, latestReading: { BOD: reading.BOD, DO: reading.DO, pH: reading.pH, turbidity: reading.turbidity, heavyMetals: reading.heavyMetals, chromium: reading.chromium, lead: reading.lead, mercury: reading.mercury, fecalColiform: reading.fecalColiform, timestamp: reading.observedAt || reading.timestamp } });
};

const getSensorReadings = async (req, res) => {
  const { location } = req.params;
  const days = Math.min(365, Math.max(1, Number.parseInt(req.query.days, 10) || 60));
  const { page, limit, skip } = getPagination(req.query, 100);
  const since = new Date(Date.now() - days * 86400000);
  const query = { location: { $regex: location, $options: 'i' }, observedAt: { $gte: since } };
  const [total, readings] = await Promise.all([
    SensorReading.countDocuments(query),
    SensorReading.find(query).sort({ observedAt: -1, timestamp: -1 }).skip(skip).limit(limit).lean(),
  ]);
  res.json({ availability: readings.length ? 'available' : 'no_data', data: readings, meta: meta(page, limit, total), source: readings[0]?.source || null, observedAt: readings[0]?.observedAt || null, fetchedAt: new Date().toISOString(), stale: false });
};

module.exports = { getStats, getRiverHealth, getSensorReadings, healthFromReading };
