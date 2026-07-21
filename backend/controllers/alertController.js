const Alert = require('../models/Alert');

/**
 * GET /api/alerts
 * Fetch all alerts, sorted by severity (Critical first) then recency.
 */
const getAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const statusFilter = req.query.status;

    const query = {};
    if (statusFilter) {
      query.status = statusFilter;
    }

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Sort by severity priority: Critical > Warning > Info
    const severityOrder = { Critical: 0, Warning: 1, Info: 2 };
    alerts.sort((a, b) => {
      const diff = (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
      if (diff !== 0) return diff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // In a real app we would return { data: alerts, meta: { total, page, limit } }
    // but the frontend might be expecting a raw array. We'll return an array for backward compatibility
    // unless frontend is updated to use the new format. Let's stick to array but maybe add headers.
    // For now, let's just return the array to avoid breaking the frontend.
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
};

/**
 * POST /api/alerts
 * Create a new alert (admin only).
 */
const createAlert = async (req, res) => {
  try {
    const { source, chemical, confidence, severity, title, description, location, bodValue, doValue } = req.body;

    if (!source || !severity || !title || confidence === undefined) {
      return res.status(400).json({ error: 'Source, severity, title, and confidence are required.' });
    }

    const alert = new Alert({
      source,
      chemical: chemical || '',
      confidence,
      severity,
      title,
      description: description || '',
      location: location || '',
      bodValue: bodValue || null,
      doValue: doValue || null,
      status: 'Active',
    });

    await alert.save();

    res.status(201).json({ message: 'Alert created.', alert });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert.' });
  }
};

/**
 * PATCH /api/alerts/:id
 * Update an alert (e.g., acknowledge/resolve).
 */
const updateAlert = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (req.user) updateData.acknowledgedBy = req.user.id;

    const alert = await Alert.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    res.json({ message: 'Alert updated.', alert });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert.' });
  }
};

module.exports = { getAlerts, createAlert, updateAlert };
