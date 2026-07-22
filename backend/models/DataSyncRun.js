const mongoose = require('mongoose');

const dataSyncRunSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  status: { type: String, enum: ['running', 'success', 'failed', 'no_data'], required: true },
  sourceUrl: { type: String, required: true },
  recordsImported: { type: Number, default: 0 },
  message: { type: String, default: '' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

dataSyncRunSchema.index({ provider: 1, createdAt: -1 });

module.exports = mongoose.model('DataSyncRun', dataSyncRunSchema);
