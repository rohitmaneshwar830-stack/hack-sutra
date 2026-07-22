const Station = require('../models/Station');
const Industry = require('../models/Industry');
const RiverStretch = require('../models/RiverStretch');
const PollutionReport = require('../models/PollutionReport');

const getLayers = async (req, res) => {
  const [stations, industries, riverStretches, reports] = await Promise.all([
    Station.find({ active: true }).lean(),
    Industry.find({ active: true }).lean(),
    RiverStretch.find().lean(),
    req.user?.role === 'citizen' ? PollutionReport.find({ citizenId: req.user.id }).select('location gpsCoords type status createdAt').lean() : PollutionReport.find().select('location gpsCoords type status createdAt').lean(),
  ]);
  res.json({ availability: stations.length || industries.length || riverStretches.length ? 'available' : 'no_data', layers: { stations, industries, riverStretches, reports, satellite: process.env.SATELLITE_TILE_URL ? { url: process.env.SATELLITE_TILE_URL, attribution: process.env.SATELLITE_ATTRIBUTION || 'Configured provider' } : null }, fetchedAt: new Date().toISOString() });
};

module.exports = { getLayers };
