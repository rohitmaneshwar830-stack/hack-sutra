const PollutionReport = require('../models/PollutionReport');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const { getPagination, meta } = require('../utils/pagination');
const httpError = require('../utils/httpError');

const createReport = async (req, res) => {
  const { location, type, description, gpsCoords } = req.body;
  if (!location || !type || !description) throw httpError(400, 'Location, type, and description are required.');
  let imageUrl = '';
  if (req.file) {
    if (!isConfigured) throw httpError(503, 'Image storage is not configured.', 'UPLOAD_NOT_CONFIGURED');
    imageUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'ganga-guardian-reports', resource_type: 'image', transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }] }, (error, result) => error ? reject(error) : resolve(result.secure_url));
      stream.end(req.file.buffer);
    });
  }
  const report = await PollutionReport.create({ citizenId: req.user.id, citizenName: req.user.name || '', location: location.trim(), type, description: description.trim(), gpsCoords: gpsCoords || '', imageUrl, status: 'Under Review' });
  res.status(201).json({ report });
};

const getReports = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const query = {};
  if (req.user.role === 'citizen') query.citizenId = req.user.id;
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) query.$or = [{ location: { $regex: req.query.search, $options: 'i' } }, { type: { $regex: req.query.search, $options: 'i' } }];
  const [total, data] = await Promise.all([PollutionReport.countDocuments(query), PollutionReport.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()]);
  res.json({ availability: data.length ? 'available' : 'no_data', data, meta: meta(page, limit, total) });
};

const updateReportStatus = async (req, res) => {
  const validStatuses = ['Pending', 'Under Review', 'Verified', 'Action Taken', 'Resolved'];
  if (!validStatuses.includes(req.body.status)) throw httpError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  const report = await PollutionReport.findByIdAndUpdate(req.params.id, { status: req.body.status, updatedAt: new Date() }, { new: true, runValidators: true });
  if (!report) throw httpError(404, 'Report not found.', 'REPORT_NOT_FOUND');
  res.json({ report });
};

module.exports = { createReport, getReports, updateReportStatus };
