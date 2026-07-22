const DataSyncRun = require('../models/DataSyncRun');
const SensorReading = require('../models/SensorReading');

const providerConfig = {
  cpcb: { env: 'CPCB_DATA_URL', name: 'CPCB' },
  indiawris: { env: 'INDIA_WRIS_DATA_URL', name: 'India-WRIS' },
};

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
};

const fetchRecords = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { Accept: 'application/json,text/csv' } });
  if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  return contentType.includes('json') ? JSON.parse(text) : parseCsv(text);
};

const normalizeReading = (record, provider, sourceUrl) => {
  const value = (keys) => {
    const key = keys.find((candidate) => record[candidate] !== undefined && record[candidate] !== '');
    return key ? Number(record[key]) : null;
  };
  const observedAt = new Date(record.observedAt || record.timestamp || record.date || record.datetime);
  const reading = { location: record.location || record.station || record.stationName, BOD: value(['BOD', 'bod']), DO: value(['DO', 'do']), pH: value(['pH', 'ph']), turbidity: value(['turbidity', 'Turbidity']), heavyMetals: value(['heavyMetals', 'heavy_metals']), chromium: value(['chromium', 'Chromium']), lead: value(['lead', 'Lead']), mercury: value(['mercury', 'Mercury']), fecalColiform: value(['fecalColiform', 'fecal_coliform']), timestamp: observedAt, observedAt, source: provider, sourceUrl };
  if (!reading.location || Number.isNaN(observedAt.getTime()) || [reading.BOD, reading.DO, reading.pH, reading.turbidity].some((value) => value === null || Number.isNaN(value))) return null;
  return reading;
};

const syncProvider = async (providerKey, suppliedUrl) => {
  const config = providerConfig[providerKey];
  if (!config) throw new Error(`Unsupported provider: ${providerKey}`);
  const sourceUrl = suppliedUrl || process.env[config.env];
  if (!sourceUrl) throw new Error(`${config.env} is not configured.`);
  const run = await DataSyncRun.create({ provider: config.name, sourceUrl, status: 'running' });
  try {
    const payload = await fetchRecords(sourceUrl);
    const records = Array.isArray(payload) ? payload : payload.data || payload.records || [];
    const readings = records.map((record) => normalizeReading(record, config.name, sourceUrl)).filter(Boolean);
    if (!readings.length) {
      await DataSyncRun.findByIdAndUpdate(run._id, { status: 'no_data', completedAt: new Date(), message: 'No valid observations matched the supported schema.' });
      return { status: 'no_data', imported: 0 };
    }
    const operations = readings.map((reading) => ({ updateOne: { filter: { location: reading.location, observedAt: reading.observedAt, source: reading.source }, update: { $set: reading }, upsert: true } }));
    const result = await SensorReading.bulkWrite(operations, { ordered: false });
    const imported = (result.upsertedCount || 0) + (result.modifiedCount || 0);
    await DataSyncRun.findByIdAndUpdate(run._id, { status: 'success', recordsImported: imported, completedAt: new Date() });
    return { status: 'success', imported };
  } catch (error) {
    await DataSyncRun.findByIdAndUpdate(run._id, { status: 'failed', completedAt: new Date(), message: error.message });
    throw error;
  }
};

module.exports = { syncProvider };
