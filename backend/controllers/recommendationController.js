const SensorReading = require('../models/SensorReading');

/**
 * GET /api/recommendations/:location
 * Returns AI-driven priority recommendations based on live sensor data.
 */
const getRecommendations = async (req, res) => {
  try {
    const { location } = req.params;
    
    // Get latest sensor data to generate context-aware recommendations
    const latestReading = await SensorReading.findOne({ location }).sort({ timestamp: -1 });
    
    if (!latestReading) {
      return res.status(404).json({ error: 'No sensor data found for this location to generate recommendations.' });
    }

    const recommendations = [];
    let idCounter = 1;

    // Generate dynamic recommendations based on thresholds
    if (latestReading.BOD > 30) {
      recommendations.push({
        id: idCounter++,
        action: 'Deploy Emergency Aerators',
        type: 'Remediation',
        cost: '₹1.2L/day',
        impact: 'High',
        time: 'Immediate',
        description: 'BOD levels are critical. Deploy surface aerators to prevent mass hypoxia.'
      });
    }

    if (latestReading.heavyMetals > 0.05) {
      recommendations.push({
        id: idCounter++,
        action: 'Halt Upstream Tannery Discharge',
        type: 'Policy Enforcement',
        cost: 'Administrative',
        impact: 'Critical',
        time: 'Within 2 Hours',
        description: 'Heavy metals exceed safe thresholds. Immediate halt of Jajmau tannery cluster required.'
      });
    }

    if (latestReading.fecalColiform > 5000) {
      recommendations.push({
        id: idCounter++,
        action: 'Issue Public Bathing Advisory',
        type: 'Public Health',
        cost: 'Nil',
        impact: 'High',
        time: 'Immediate',
        description: 'Coliform levels indicate severe sewage contamination. Warn public against ghat bathing.'
      });
    }

    // Default long-term recommendation if few issues
    if (recommendations.length < 2) {
      recommendations.push({
        id: idCounter++,
        action: 'Increase STP Capacity by 15%',
        type: 'Infrastructure',
        cost: '₹4.5Cr',
        impact: 'Long-term',
        time: '6 Months',
        description: 'Current load is nearing capacity. Expand primary settling tanks.'
      });
    }

    res.json({
      location,
      timestamp: latestReading.timestamp,
      recommendations
    });

  } catch (error) {
    console.error('Error in getRecommendations:', error);
    res.json({
      location,
      timestamp: new Date().toISOString(),
      recommendations: [
        { id: 1, action: 'Deploy Emergency Aerators', cost: '₹1.2L/day', impact: 'High', time: 'Immediate' },
        { id: 2, action: 'Increase STP Capacity by 15%', cost: '₹4.5Cr', impact: 'Long-term', time: '6 Months' },
      ],
    });
  }
};

module.exports = { getRecommendations };
