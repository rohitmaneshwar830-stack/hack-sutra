const Alert = require('../models/Alert');
const { getPagination, meta } = require('../utils/pagination');
const httpError = require('../utils/httpError');

const getAlerts = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.severity) query.severity = req.query.severity;
  if (req.query.location) query.location = { $regex: req.query.location, $options: 'i' };
  const [total, data] = await Promise.all([Alert.countDocuments(query), Alert.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()]);
  res.json({ availability: data.length ? 'available' : 'no_data', data, meta: meta(page, limit, total), fetchedAt: new Date().toISOString() });
};

const createAlert = async (req, res) => {
  const { source, chemical, confidence, severity, title, description, location, bodValue, doValue } = req.body;
  if (!source || !severity || !title || confidence === undefined) throw httpError(400, 'Source, severity, title, and confidence are required.');
  const alert = await Alert.create({ source, chemical, confidence, severity, title, description, location, bodValue, doValue, status: 'Active' });
  res.status(201).json({ alert });
};

const updateAlert = async (req, res) => {
  const { status } = req.body;
  if (status && !['Active', 'Acknowledged', 'Resolved'].includes(status)) throw httpError(400, 'Invalid alert status.');
  const alert = await Alert.findByIdAndUpdate(req.params.id, { ...(status ? { status } : {}), acknowledgedBy: req.user.id, updatedAt: new Date() }, { new: true, runValidators: true });
  if (!alert) throw httpError(404, 'Alert not found.', 'ALERT_NOT_FOUND');
  res.json({ alert });
};

module.exports = { getAlerts, createAlert, updateAlert };
