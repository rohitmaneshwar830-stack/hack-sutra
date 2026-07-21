const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
  },
  chemical: {
    type: String,
    default: '',
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Critical', 'Warning', 'Info'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  bodValue: {
    type: Number,
    default: null,
  },
  doValue: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ['Active', 'Acknowledged', 'Resolved'],
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
});

alertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

alertSchema.index({ severity: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
