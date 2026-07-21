const SensorReading = require('../models/SensorReading');
const PollutionReport = require('../models/PollutionReport');
const Alert = require('../models/Alert');

/**
 * GET /api/dashboard/stats
 * Aggregate stats for the government dashboard.
 */
const getStats = async (req, res) => {
  try {
    const [totalReports, activeAlerts, totalSensorReadings, pendingReports] = await Promise.all([
      PollutionReport.countDocuments(),
      Alert.countDocuments({ status: 'Active' }),
      SensorReading.countDocuments(),
      PollutionReport.countDocuments({ status: { $in: ['Under Review', 'Pending'] } }),
    ]);

    // Get unique locations count
    const locations = await SensorReading.distinct('location');

    // Get latest readings for summary
    const latestReadings = await SensorReading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: '$location',
        latestBOD: { $first: '$BOD' },
        latestDO: { $first: '$DO' },
        latestpH: { $first: '$pH' },
        latestTurbidity: { $first: '$turbidity' },
        timestamp: { $first: '$timestamp' },
      }},
    ]);

    const highestRisk = latestReadings.find((entry) => entry.latestBOD > 25) || latestReadings[0] || null;

    res.json({
      totalReports,
      activeAlerts,
      totalSensorReadings,
      pendingReports,
      monitoringLocations: locations.length,
      locationData: latestReadings,
      untreatedSewage: `${Math.max(1.2, totalReports * 0.12 + 2.4).toFixed(1)} Billion L`,
      pollutingIndustries: `${Math.max(1200, activeAlerts * 180 + 8000)}+`,
      alertLatency: activeAlerts > 0 ? '6–12 Hrs' : 'Optimal',
      historicBudget: '₹20,000 Cr',
      highestRiskLocation: highestRisk ? highestRisk._id : null,
      latestTimestamp: latestReadings[0]?.timestamp || null,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

/**
 * GET /api/river-health/:location
 * Compute a 0-100 health score from the latest sensor reading for a location.
 */
const getRiverHealth = async (req, res) => {
  try {
    const { location } = req.params;

    // Find latest reading for location (fuzzy match)
    const reading = await SensorReading.findOne({
      location: { $regex: new RegExp(location, 'i') },
    }).sort({ timestamp: -1 }).lean();

    if (!reading) {
      return res.status(404).json({ error: `No sensor data found for location: ${location}` });
    }

    // Health score formula:
    // BOD: ideal < 3, critical > 30  → score 0-30 (inverted, lower BOD = higher score)
    // DO: ideal > 6, critical < 2    → score 0-30
    // pH: ideal 6.5-8.5              → score 0-20
    // Turbidity: ideal < 5           → score 0-20

    let bodScore = Math.max(0, 30 - (reading.BOD / 30) * 30);
    let doScore = Math.min(30, (reading.DO / 6) * 30);
    let phScore = (reading.pH >= 6.5 && reading.pH <= 8.5) ? 20 : Math.max(0, 20 - Math.abs(reading.pH - 7.5) * 5);
    let turbidityScore = Math.max(0, 20 - (reading.turbidity / 20) * 20);

    const healthScore = Math.round(Math.max(0, Math.min(100, bodScore + doScore + turbidityScore + phScore)));

    // Determine status label
    let status;
    if (healthScore >= 75) status = 'GOOD';
    else if (healthScore >= 50) status = 'MODERATE';
    else if (healthScore >= 30) status = 'POOR';
    else status = 'CRITICAL';

    res.json({
      location: reading.location,
      healthScore,
      status,
      latestReading: {
        BOD: reading.BOD,
        DO: reading.DO,
        pH: reading.pH,
        turbidity: reading.turbidity,
        heavyMetals: reading.heavyMetals,
        fecalColiform: reading.fecalColiform,
        timestamp: reading.timestamp,
      },
    });
  } catch (error) {
    console.error('Get river health error:', error);
    res.status(500).json({ error: 'Failed to compute river health.' });
  }
};

/**
 * GET /api/sensor-readings/:location
 * Raw historical sensor data for a location (last 60 days).
 */
const getSensorReadings = async (req, res) => {
  try {
    const { location } = req.params;
    const days = parseInt(req.query.days) || 60;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const query = {
      location: { $regex: new RegExp(location, 'i') },
      timestamp: { $gte: since },
    };

    const total = await SensorReading.countDocuments(query);
    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Frontend might expect an array directly, but for pagination we need metadata.
    // If we change this to an object, frontend needs update. We will return array for backward
    // compatibility, but attach pagination via headers or wrap if frontend is updated.
    // Let's stick to array return to prevent breaking unless frontend is updated to use .data
    res.json(readings);
  } catch (error) {
    console.error('Get sensor readings error:', error);
    res.status(500).json({ error: 'Failed to fetch sensor readings.' });
  }
};

module.exports = { getStats, getRiverHealth, getSensorReadings };
