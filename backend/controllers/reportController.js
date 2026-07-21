const PollutionReport = require('../models/PollutionReport');
const fallbackStore = require('../utils/fallbackStore');

/**
 * POST /api/reports
 * Create a new pollution report (citizen only).
 * Supports optional image upload via multipart form.
 */
const createReport = async (req, res) => {
  try {
    const { location, type, description, gpsCoords } = req.body;

    if (!location || !type || !description) {
      return res.status(400).json({ error: 'Location, type, and description are required.' });
    }

    let report;
    try {
      report = new PollutionReport({
        citizenId: req.user.id,
        citizenName: req.user.name || 'Anonymous Citizen',
        location,
        type,
        description,
        gpsCoords: gpsCoords || '',
        imageUrl: req.file ? req.file.path : '',
        status: 'Under Review',
      });

      await report.save();
    } catch (error) {
      report = fallbackStore.createReport({
        citizenId: req.user.id,
        citizenName: req.user.name || 'Anonymous Citizen',
        location,
        type,
        description,
        gpsCoords: gpsCoords || '',
        status: 'Under Review',
      });
    }

    res.status(201).json({
      message: 'Report submitted successfully.',
      report,
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report.' });
  }
};

/**
 * GET /api/reports
 * Fetch reports — citizens see their own, admins see all.
 */
const getReports = async (req, res) => {
  try {
    let reports = [];

    try {
      let query = {};

      // Citizens only see their own reports
      if (req.user.role === 'citizen') {
        query.citizenId = req.user.id;
      }

      reports = await PollutionReport.find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    } catch (error) {
      reports = fallbackStore.listReports(req.user.role === 'citizen' ? req.user.id : null);
    }

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

/**
 * PATCH /api/reports/:id
 * Update report status (admin only).
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Verified', 'Action Taken', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const report = await PollutionReport.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.json({ message: 'Report status updated.', report });
  } catch (error) {
    console.error('Update report error:', error);
    const report = fallbackStore.updateReportStatus(id, status);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    res.json({ message: 'Report status updated.', report });
  }
};

module.exports = { createReport, getReports, updateReportStatus };
