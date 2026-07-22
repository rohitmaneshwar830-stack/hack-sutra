const mongoose = require('mongoose');

const industryComplianceSchema = new mongoose.Schema({
  industry: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true },
  pollutant: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  limit: { type: Number, required: true },
  observedAt: { type: Date, required: true },
  source: { type: String, required: true },
  sourceUrl: { type: String, required: true },
}, { timestamps: true });

industryComplianceSchema.index({ industry: 1, observedAt: -1 });

module.exports = mongoose.model('IndustryCompliance', industryComplianceSchema);
