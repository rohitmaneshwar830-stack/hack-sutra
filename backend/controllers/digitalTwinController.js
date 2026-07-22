const DigitalTwinSimulation = require('../models/DigitalTwinSimulation');
const SensorReading = require('../models/SensorReading');

const runSimulation = async (req, res) => {
  const { location, haltTanneries = false, stpBypass = false, aerators = false } = req.body;
  const baseline = await SensorReading.findOne({ location: { $regex: location || '', $options: 'i' } }).sort({ observedAt: -1 }).lean();
  if (!baseline) return res.json({ availability: 'no_data', simulation: null, message: 'A real station observation is required before running a simulation.' });

  const interventions = [];
  let bodAfter = baseline.BOD;
  let fishKillBefore = Math.min(100, Math.max(0, baseline.BOD * 2 + (baseline.DO < 3 ? 25 : 0)));
  let fishKillAfter = fishKillBefore;
  if (haltTanneries) { bodAfter *= 0.62; fishKillAfter *= 0.45; interventions.push('Halt upstream industrial discharge'); }
  if (stpBypass) { bodAfter *= 1.18; fishKillAfter *= 1.15; interventions.push('Resolve sewage treatment overflow'); }
  if (aerators) { fishKillAfter *= 0.82; interventions.push('Deploy emergency aerators'); }
  bodAfter = Math.max(0, Number(bodAfter.toFixed(2)));
  fishKillAfter = Math.min(100, Math.max(0, Number(fishKillAfter.toFixed(2))));
  const simulation = await DigitalTwinSimulation.create({ scenario: interventions.join(' + ') || 'No interventions selected', interventions, beforeValues: { bodLevel: baseline.BOD, fishKillRisk: fishKillBefore, dolphinHabitatRisk: fishKillBefore > 60 ? 'HIGH RISK' : 'MODERATE RISK' }, afterValues: { bodLevel: bodAfter, fishKillRisk: fishKillAfter, dolphinHabitatRisk: fishKillAfter > 60 ? 'HIGH RISK' : fishKillAfter > 30 ? 'MODERATE RISK' : 'LOW RISK' } });
  res.json({ availability: 'available', source: baseline.source, observedAt: baseline.observedAt, assumptions: 'Scenario coefficients are configurable planning estimates, not measured outcomes.', simulation: { ...simulation.toObject(), bodReduction: baseline.BOD ? Math.round((1 - bodAfter / baseline.BOD) * 100) : 0, fishKillReduction: Math.round(fishKillBefore - fishKillAfter) } });
};

module.exports = { runSimulation };
