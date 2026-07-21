const mongoose = require('mongoose');

const pollutionReportSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  citizenName: {
    type: String,
    default: 'Anonymous Citizen',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  type: {
    type: String,
    enum: ['Sewage Discharge', 'Industrial Effluent', 'Solid Waste / Plastic', 'Oil Spill', 'Dead Aquatic Life', 'Other'],
    required: [true, 'Pollution type is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  gpsCoords: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Verified', 'Action Taken', 'Resolved'],
    default: 'Under Review',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

pollutionReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

pollutionReportSchema.index({ citizenId: 1, createdAt: -1 });
pollutionReportSchema.index({ status: 1 });

module.exports = mongoose.model('PollutionReport', pollutionReportSchema);
