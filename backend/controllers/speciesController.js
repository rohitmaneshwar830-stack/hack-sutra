const SpeciesAlert = require('../models/SpeciesAlert');
const { getPagination, meta } = require('../utils/pagination');

const getSpeciesAlerts = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const query = req.query.speciesName ? { speciesName: { $regex: req.query.speciesName, $options: 'i' } } : {};
  const [total, data] = await Promise.all([SpeciesAlert.countDocuments(query), SpeciesAlert.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean()]);
  res.json({ availability: data.length ? 'available' : 'no_data', data, meta: meta(page, limit, total), fetchedAt: new Date().toISOString() });
};

module.exports = { getSpeciesAlerts };
