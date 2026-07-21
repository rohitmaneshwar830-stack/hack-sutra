const DigitalTwinSimulation = require('../models/DigitalTwinSimulation');

/**
 * POST /api/digital-twin/simulate
 * Run a policy intervention simulation.
 * Accepts toggles matching the frontend DigitalTwin.jsx logic.
 */
const runSimulation = async (req, res) => {
  try {
    const { haltTanneries, stpBypass, aerators } = req.body;

    // Before values (baseline)
    let bodBefore = 61;
    let bodAfter = 61;
    let fishKillBefore = 70;
    let fishKillAfter = 70;
    let dolphinBefore = 'HIGH RISK';
    let dolphinAfter = 'HIGH RISK';

    const interventions = [];

    if (haltTanneries) {
      bodAfter -= 23;
      fishKillAfter -= 45;
      dolphinAfter = 'MODERATE';
      interventions.push('Halt Jajmau Tannery Cluster');
    }

    if (stpBypass) {
      bodAfter -= 10;
      fishKillAfter -= 15;
      interventions.push('STP Overflow Bypass');
    }

    if (aerators) {
      fishKillAfter -= 10;
      interventions.push('Emergency Aerators');
    }

    // Boundary limits
    bodAfter = Math.max(12, bodAfter);
    fishKillAfter = Math.max(5, fishKillAfter);
    if (bodAfter < 30) dolphinAfter = 'LOW RISK';

    const simulation = new DigitalTwinSimulation({
      scenario: interventions.length > 0 ? interventions.join(' + ') : 'No interventions selected',
      interventions,
      beforeValues: {
        bodLevel: bodBefore,
        fishKillRisk: fishKillBefore,
        dolphinHabitatRisk: dolphinBefore,
      },
      afterValues: {
        bodLevel: bodAfter,
        fishKillRisk: fishKillAfter,
        dolphinHabitatRisk: dolphinAfter,
      },
    });

    await simulation.save();

    res.json({
      simulation: {
        id: simulation._id,
        scenario: simulation.scenario,
        interventions: simulation.interventions,
        beforeValues: simulation.beforeValues,
        afterValues: simulation.afterValues,
        bodReduction: Math.round((1 - bodAfter / bodBefore) * 100),
        fishKillReduction: fishKillBefore - fishKillAfter,
        createdAt: simulation.createdAt,
      },
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Failed to run simulation.' });
  }
};

module.exports = { runSimulation };
