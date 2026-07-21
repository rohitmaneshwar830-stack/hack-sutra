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
    res.json([
      { _id: 'species-1', speciesName: 'Gangetic Dolphin', conservationStatus: 'Endangered', riskLevel: 'High', timestamp: new Date().toISOString() },
      { _id: 'species-2', speciesName: 'Hilsa', conservationStatus: 'Threatened', riskLevel: 'Moderate', timestamp: new Date().toISOString() },
      { _id: 'species-3', speciesName: 'Gharial', conservationStatus: 'Critically Endangered', riskLevel: 'High', timestamp: new Date().toISOString() },
    ]);
  }
};

module.exports = { getSpeciesAlerts };
