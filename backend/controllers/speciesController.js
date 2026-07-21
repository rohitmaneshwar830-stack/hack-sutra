const SpeciesAlert = require('../models/SpeciesAlert');

/**
 * GET /api/species-alerts
 * Fetch all biodiversity risk data.
 */
const getSpeciesAlerts = async (req, res) => {
  try {
    const alerts = await SpeciesAlert.find().sort({ timestamp: -1 }).lean();
    res.json(alerts);
  } catch (error) {
    console.error('Get species alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch species alerts.' });
  }
};

module.exports = { getSpeciesAlerts };
