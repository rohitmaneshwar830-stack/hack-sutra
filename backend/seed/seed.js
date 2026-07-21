/**
 * Seed Script for Ganga Guardian AI
 * Populates MongoDB with demo users, synthetic sensor data, alerts,
 * species alerts, and sample pollution reports.
 *
 * Run: cd backend && node seed/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const SensorReading = require('../models/SensorReading');
const Alert = require('../models/Alert');
const SpeciesAlert = require('../models/SpeciesAlert');
const PollutionReport = require('../models/PollutionReport');
const Prediction = require('../models/Prediction');
const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────
const LOCATIONS = [
  { name: 'Kanpur-Jajmau', baseBOD: 42, baseDO: 2.5, basePH: 7.6, baseTurbidity: 16, baseHeavyMetals: 0.12, baseColiform: 8500 },
  { name: 'Prayagraj-Sangam', baseBOD: 20, baseDO: 5.2, basePH: 7.8, baseTurbidity: 8, baseHeavyMetals: 0.04, baseColiform: 3200 },
  { name: 'Varanasi-Ghats', baseBOD: 16, baseDO: 4.6, basePH: 7.9, baseTurbidity: 12, baseHeavyMetals: 0.06, baseColiform: 5100 },
];
const DAYS = 60;

// ─── Helpers ─────────────────────────────────────────────────
function gaussianNoise(mean, stddev) {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate 60 days of synthetic sensor readings for one location.
 * Includes seasonal patterns, weekly cycles, and random industrial spikes.
 */
function generateSensorData(loc) {
  const readings = [];
  const now = new Date();

  for (let d = DAYS; d >= 0; d--) {
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - d);
    timestamp.setHours(12, 0, 0, 0); // Noon each day

    // Seasonal wave (higher pollution in summer months)
    const dayOfYear = Math.floor((timestamp - new Date(timestamp.getFullYear(), 0, 0)) / 86400000);
    const seasonalFactor = 1 + 0.15 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2);

    // Weekly cycle (slightly higher on weekdays due to industrial activity)
    const dayOfWeek = timestamp.getDay();
    const weekdayFactor = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.08 : 0.92;

    // Random industrial spike (5% chance per day)
    const spike = Math.random() < 0.05 ? 1.5 + Math.random() * 0.8 : 1.0;

    // Generate values with noise
    const BOD = clamp(
      Math.round(gaussianNoise(loc.baseBOD * seasonalFactor * weekdayFactor * spike, loc.baseBOD * 0.12) * 10) / 10,
      2, 80
    );
    const DO = clamp(
      Math.round(gaussianNoise(loc.baseDO / (spike * 0.6 + 0.4), loc.baseDO * 0.15) * 10) / 10,
      0.5, 10
    );
    const pH = clamp(
      Math.round(gaussianNoise(loc.basePH, 0.3) * 10) / 10,
      5.5, 9.5
    );
    const turbidity = clamp(
      Math.round(gaussianNoise(loc.baseTurbidity * seasonalFactor * spike, loc.baseTurbidity * 0.2) * 10) / 10,
      1, 60
    );
    const heavyMetals = clamp(
      Math.round(gaussianNoise(loc.baseHeavyMetals * spike, 0.03) * 1000) / 1000,
      0, 1
    );
    const fecalColiform = clamp(
      Math.round(gaussianNoise(loc.baseColiform * seasonalFactor * spike, loc.baseColiform * 0.2)),
      100, 30000
    );

    readings.push({
      location: loc.name,
      BOD, DO, pH, turbidity, heavyMetals, fecalColiform,
      timestamp,
    });
  }

  return readings;
}

// ─── Main Seed Function ──────────────────────────────────────
async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // ── 1. Generate Sensor Readings & Export to CSV First (Independent of DB) ──
    let allReadings = [];
    for (const loc of LOCATIONS) {
      const readings = generateSensorData(loc);
      allReadings = allReadings.concat(readings);
    }

    const csvDir = path.join(__dirname, '..', '..', 'ml-service', 'data');
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }

    const csvHeader = 'location,BOD,DO,pH,turbidity,heavyMetals,fecalColiform,timestamp\n';
    const csvRows = allReadings.map(r =>
      `${r.location},${r.BOD},${r.DO},${r.pH},${r.turbidity},${r.heavyMetals},${r.fecalColiform},${r.timestamp.toISOString()}`
    ).join('\n');
    fs.writeFileSync(path.join(csvDir, 'sensor_readings.csv'), csvHeader + csvRows);
    console.log(`📁 Exported sensor data to ml-service/data/sensor_readings.csv\n`);

    // ── 2. Generate classifier training data ──
    const classifierData = generateClassifierTrainingData();
    const classifierCsv = 'location,chromium,lead,mercury,bod,do,turbidity,source_label\n' +
      classifierData.map(r =>
        `${r.location},${r.chromium},${r.lead},${r.mercury},${r.bod},${r.do},${r.turbidity},${r.source_label}`
      ).join('\n');
    fs.writeFileSync(path.join(csvDir, 'classifier_training.csv'), classifierCsv);
    console.log(`📁 Generated classifier training data (${classifierData.length} samples)\n`);

    // ── 3. Attempt MongoDB seeding ──
    console.log('Connecting to MongoDB...');
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB\n');
    } catch (dbError) {
      console.warn(`⚠️  MongoDB connection failed (${dbError.message}). CSV generation succeeded, but DB was not seeded.`);
      console.warn('Set MONGO_URI in .env to a valid MongoDB connection string to enable DB queries.');
      process.exit(0);
    }

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      SensorReading.deleteMany({}),
      Alert.deleteMany({}),
      SpeciesAlert.deleteMany({}),
      PollutionReport.deleteMany({}),
      Prediction.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing collections\n');

    // ── 4. Seed Users ──
    const adminUser = new User({
      name: 'Rohit Maneshwer',
      email: 'admin@ganga.ai',
      passwordHash: '123456', // pre-save hook hashes this
      role: 'admin',
      department: 'Ministry of Jal Shakti',
    });

    const citizenUser = new User({
      name: 'Citizen User',
      email: 'citizen@ganga.ai',
      passwordHash: '123456',
      role: 'citizen',
      phone: '+91 98765-43210',
    });

    const govOfficerUser = new User({
      name: 'Regional Director',
      email: 'officer@ganga.ai',
      passwordHash: '123456',
      role: 'government_officer',
      department: 'CPCB Regional Office',
    });

    const industryUser = new User({
      name: 'Tannery Operations Manager',
      email: 'industry@ganga.ai',
      passwordHash: '123456',
      role: 'industry',
      department: 'Jajmau Tannery Cluster',
    });

    await adminUser.save();
    await citizenUser.save();
    await govOfficerUser.save();
    await industryUser.save();
    console.log('👤 Seeded 4 demo users (admin@, citizen@, officer@, industry@)\n');

    // ── 5. Seed Sensor Readings ──
    await SensorReading.insertMany(allReadings);
    console.log(`📊 Seeded ${allReadings.length} sensor readings (${DAYS + 1} days × ${LOCATIONS.length} locations)\n`);

    // ── 3. Seed Alerts ──
    const alerts = [
      {
        source: 'Jajmau Tannery Cluster, Kanpur',
        chemical: 'Hexavalent Chromium (Cr⁶⁺)',
        confidence: 80,
        severity: 'Critical',
        title: 'Chromium Contamination Detected',
        description: 'AI anomaly detection identified hexavalent chromium discharge from Jajmau tannery industrial cluster.',
        location: 'Kanpur-Jajmau',
        bodValue: 48,
        doValue: 2.1,
        status: 'Active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        source: 'Municipal Sewage Overflow',
        chemical: 'Raw municipal organic overload',
        confidence: 73,
        severity: 'Warning',
        title: 'Sewage Surge — Allahabad Junction',
        description: 'Municipal sewage overflow detected at Prayagraj junction causing elevated BOD.',
        location: 'Prayagraj-Sangam',
        bodValue: 22,
        doValue: 5.4,
        status: 'Active',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        source: 'Monsoon runoff + upstream soil discharge',
        chemical: 'Suspended particulates',
        confidence: 65,
        severity: 'Info',
        title: 'Elevated Turbidity — Varanasi Ghat',
        description: 'Turbidity levels elevated due to monsoon runoff and upstream soil discharge.',
        location: 'Varanasi-Ghats',
        bodValue: 18,
        doValue: 4.8,
        status: 'Active',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
    ];

    await Alert.insertMany(alerts);
    console.log(`🚨 Seeded ${alerts.length} alerts\n`);

    // ── 4. Seed Species Alerts ──
    const speciesAlerts = [
      {
        speciesName: 'Gangetic Dolphin',
        scientificName: 'Platanista gangetica',
        conservationStatus: 'Endangered',
        location: 'Kanpur to Prayagraj',
        habitat: 'Kanpur to Prayagraj deep pool stretches',
        threats: 'Bioaccumulation of chromium, industrial noise, STP overflows',
        population: 'Estimated 2,500 - 3,000 remaining in basin',
        riskLevel: 'HIGH',
      },
      {
        speciesName: 'Hilsa Fish',
        scientificName: 'Tenualosa ilisha',
        conservationStatus: 'Varanasi Passage Restricted',
        location: 'Farakka to Varanasi',
        habitat: 'Estuary spawning grounds up to Farakka Barrage',
        threats: 'High BOD blockage, heavy municipal organic loads',
        population: 'Declining migrations recorded annually',
        riskLevel: 'CRITICAL',
      },
      {
        speciesName: 'Gharial',
        scientificName: 'Gavialis gangeticus',
        conservationStatus: 'Critically Endangered',
        location: 'Chambal confluence',
        habitat: 'Chambal tributary confluence stretches',
        threats: 'River bed mining, industrial runoff spikes',
        population: 'High sandbar telemetry monitoring active',
        riskLevel: 'ALERT',
      },
    ];

    await SpeciesAlert.insertMany(speciesAlerts);
    console.log(`🐬 Seeded ${speciesAlerts.length} species alerts\n`);

    // ── 5. Seed Sample Reports ──
    const reports = [
      {
        citizenId: citizenUser._id,
        citizenName: 'Citizen #4821',
        location: 'Kanpur Ghat',
        type: 'Industrial Effluent',
        description: 'Dark colored discharge observed flowing from industrial pipe near ghat area.',
        status: 'Under Review',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        citizenId: citizenUser._id,
        citizenName: 'NGO Worker',
        location: 'Varanasi Ghats',
        type: 'Solid Waste / Plastic',
        description: 'Large accumulation of plastic waste and garbage near bathing ghats.',
        status: 'Verified',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        citizenId: citizenUser._id,
        citizenName: 'NMCG Official',
        location: 'Prayagraj Sangam',
        type: 'Sewage Discharge',
        description: 'Raw sewage discharge observed flowing into confluence area during peak hours.',
        status: 'Action Taken',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        citizenId: citizenUser._id,
        citizenName: 'Citizen #3301',
        location: 'Haridwar Har Ki Pauri',
        type: 'Oil Spill',
        description: 'Oil sheen observed on water surface near main bathing area.',
        status: 'Resolved',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    ];

    await PollutionReport.insertMany(reports);
    console.log(`📋 Seeded ${reports.length} sample pollution reports\n`);

    console.log('━'.repeat(50));
    console.log('✅ Database seeded successfully!');
    console.log('━'.repeat(50));


    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

/**
 * Generate synthetic labeled training data for pollution source classifier.
 */
function generateClassifierTrainingData() {
  const profiles = [
    { label: 'Jajmau Tannery Cluster', chromiumBase: 0.15, leadBase: 0.02, mercuryBase: 0.001, location: 'Kanpur-Jajmau' },
    { label: 'Municipal Sewage Overflow', chromiumBase: 0.01, leadBase: 0.01, mercuryBase: 0.0005, location: 'Prayagraj-Sangam' },
    { label: 'Varanasi Industrial Runoff', chromiumBase: 0.04, leadBase: 0.05, mercuryBase: 0.003, location: 'Varanasi-Ghats' },
    { label: 'Paper Mill Discharge', chromiumBase: 0.02, leadBase: 0.01, mercuryBase: 0.0002, location: 'Kanpur-Jajmau' },
    { label: 'Textile Dye Effluent', chromiumBase: 0.08, leadBase: 0.03, mercuryBase: 0.001, location: 'Varanasi-Ghats' },
  ];

  const samples = [];
  for (const profile of profiles) {
    for (let i = 0; i < 40; i++) {
      samples.push({
        location: profile.location,
        chromium: clamp(Math.round(gaussianNoise(profile.chromiumBase, profile.chromiumBase * 0.3) * 1000) / 1000, 0, 1),
        lead: clamp(Math.round(gaussianNoise(profile.leadBase, profile.leadBase * 0.4) * 1000) / 1000, 0, 1),
        mercury: clamp(Math.round(gaussianNoise(profile.mercuryBase, profile.mercuryBase * 0.5) * 10000) / 10000, 0, 0.1),
        bod: clamp(Math.round(gaussianNoise(35, 15) * 10) / 10, 2, 80),
        do: clamp(Math.round(gaussianNoise(3.5, 1.5) * 10) / 10, 0.5, 10),
        turbidity: clamp(Math.round(gaussianNoise(15, 8) * 10) / 10, 1, 60),
        source_label: profile.label,
      });
    }
  }

  return samples;
}

seed();
