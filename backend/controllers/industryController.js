const Industry = require('../models/Industry');
const IndustryCompliance = require('../models/IndustryCompliance');

const getCompliance = async (req, res) => {
  const user = req.user.role === 'industry' ? await require('../models/User').findById(req.user.id).lean() : null;
  const industry = req.user.role === 'industry' ? await Industry.findById(user?.industryId).lean() : await Industry.findById(req.query.industryId).lean();
  if (!industry) return res.json({ availability: 'no_data', industry: null, records: [], alerts: [] });
  const records = await IndustryCompliance.find({ industry: industry._id }).sort({ observedAt: -1 }).limit(100).lean();
  const alerts = records.filter((record) => record.value > record.limit).map((record) => ({ ...record, severity: record.value > record.limit * 1.25 ? 'Critical' : 'Warning' }));
  res.json({ availability: records.length ? 'available' : 'no_data', industry, records, alerts, source: records[0]?.source || null, observedAt: records[0]?.observedAt || null, fetchedAt: new Date().toISOString() });
};

module.exports = { getCompliance };
