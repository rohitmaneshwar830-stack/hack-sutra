const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  location: { type: String, default: '' },
  coordinates: { type: [Number], required: true },
  provider: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  externalId: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

industrySchema.index({ coordinates: '2dsphere' });
industrySchema.index({ provider: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model('Industry', industrySchema);
