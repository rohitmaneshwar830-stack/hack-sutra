const mongoose = require('mongoose');

const riverStretchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  geometry: { type: Object, required: true },
  provider: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  externalId: { type: String, required: true },
}, { timestamps: true });

riverStretchSchema.index({ geometry: '2dsphere' });
riverStretchSchema.index({ provider: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model('RiverStretch', riverStretchSchema);
