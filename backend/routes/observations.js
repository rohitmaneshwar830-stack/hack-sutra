const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../middleware/asyncHandler');
const SensorReading = require('../models/SensorReading');
const { getPagination, meta } = require('../utils/pagination');

const router = express.Router();
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {};
  if (req.query.location) query.location = { $regex: req.query.location, $options: 'i' };
  if (req.query.source) query.source = req.query.source;
  if (req.query.from || req.query.to) query.observedAt = {};
  if (req.query.from) query.observedAt.$gte = new Date(req.query.from);
  if (req.query.to) query.observedAt.$lte = new Date(req.query.to);
  const [total, data] = await Promise.all([SensorReading.countDocuments(query), SensorReading.find(query).sort({ observedAt: -1 }).skip(skip).limit(limit).lean()]);
  res.json({ availability: data.length ? 'available' : 'no_data', data, meta: meta(page, limit, total), source: data[0]?.source || null, observedAt: data[0]?.observedAt || null, fetchedAt: new Date().toISOString(), stale: false });
}));

module.exports = router;
