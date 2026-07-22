const DataSyncRun = require('../models/DataSyncRun');
const { syncProvider } = require('../services/dataSyncService');

const sync = async (req, res) => {
  const result = await syncProvider(req.params.provider.toLowerCase(), req.body.url);
  res.json({ provider: req.params.provider, ...result });
};

const status = async (req, res) => {
  const data = await DataSyncRun.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json({ data });
};

module.exports = { sync, status };
