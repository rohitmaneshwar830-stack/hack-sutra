import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { AlertCircle, ShieldAlert, Cpu, FileText, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export default function AIAlerts({ onNavigate }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [notifiedItems, setNotifiedItems] = useState({});
  const simulationRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.get('/alerts');
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAction = (alertId, actionName) => {
    setNotifiedItems(prev => ({
      ...prev,
      [`${alertId}-${actionName}`]: true
    }));
    toast.success(`Action initiated: "${actionName}" for Alert #${alertId}. Notifications dispatched to regional enforcement units.`);
  };

  const triggerSimulation = async () => {
    setShowSimulation(true);
    setSimulating(true);
    setTimeout(() => {
      simulationRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);

    try {
      // Simulate by calling the digital twin endpoint with standard values
      const response = await api.post('/digital-twin/simulate', {
        haltTanneries: true,
        stpBypass: false,
        aerators: false
      });
      setSimulationData(response.simulation);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const getAlertStyle = (severity) => {
    if (severity === 'Critical') return 'border-l-alert-red';
    if (severity === 'Warning') return 'border-l-accent';
    return 'border-l-yellow-400';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'Critical') return <ShieldAlert className="text-alert-red h-8 w-8 shrink-0 opacity-85" />;
    return <AlertCircle className="text-accent h-8 w-8 shrink-0 opacity-85" />;
  };

  const getBadgeStyle = (severity) => {
    if (severity === 'Critical') return 'bg-alert-red text-white';
    if (severity === 'Warning') return 'bg-accent text-white';
    return 'bg-yellow-400 text-gray-900';
  };

  return (
    <div className="max-w-250 mx-auto px-4 py-10 min-h-screen text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-primary pb-4 mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-primary uppercase tracking-wide font-outfit">
            AI-Generated Pollution Alerts — Live Feed
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
            Real-time machine learning anomaly detection
          </p>
        </div>
        <div className="bg-alert-red text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 shrink-0">
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <span>{loading ? '...' : alerts.length} Active Alerts</span>
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary h-12 w-12" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center rounded-sm">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-700 uppercase">No Active Alerts</h3>
          <p className="text-xs text-gray-400 mt-2">The river quality telemetry matches standard parameters.</p>
        </div>
      ) : (
        <div className="space-y-6 mb-12">
          {alerts.map((alert) => (
            <div key={alert._id} className={`bg-white border border-gray-200 border-l-4 ${getAlertStyle(alert.severity)} shadow-md rounded-r-sm overflow-hidden`}>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm tracking-wider uppercase ${getBadgeStyle(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        Confidence: {alert.confidence}% | Detected: {new Date(alert.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 font-outfit uppercase">
                      {alert.title}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Source: {alert.source} {alert.chemical ? `| Chemical: ${alert.chemical}` : ''}
                    </p>
                  </div>
                  {getSeverityIcon(alert.severity)}
                </div>

                {(alert.bodValue || alert.doValue) && (
                  <div className="bg-gray-50 p-3.5 border border-gray-150 rounded flex gap-8">
                    {alert.bodValue && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">BOD Level</span>
                        <div className="font-bold text-alert-red text-sm">
                          {alert.bodValue} mg/L <span className="text-[10px] text-gray-400 font-semibold">(Limit: 3 mg/L)</span>
                        </div>
                      </div>
                    )}
                    {alert.doValue && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">DO Level</span>
                        <div className="font-bold text-alert-red text-sm">
                          {alert.doValue} mg/L <span className="text-[10px] text-gray-400 font-semibold">(Safe: &gt;4 mg/L)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={() => handleAction(alert._id, 'Notify Party')}
                    className={`text-xs font-bold px-4 py-2 rounded-sm shadow-sm transition-all uppercase tracking-wider cursor-pointer ${
                      notifiedItems[`${alert._id}-Notify Party`]
                        ? 'bg-green-700 text-white cursor-default'
                        : 'bg-primary hover:bg-primary/95 text-white'
                    }`}
                  >
                    {notifiedItems[`${alert._id}-Notify Party`] ? 'Notified ✓' : 'Notify Factory'}
                  </button>
                  <button
                    onClick={() => handleAction(alert._id, 'Escalate to CPCB')}
                    className="border border-primary text-primary hover:bg-primary/5 text-xs font-bold px-4 py-2 rounded-sm transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Escalate to CPCB
                  </button>
                  <button
                    onClick={triggerSimulation}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold px-4 py-2 rounded-sm transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-gray-50"
                  >
                    <Cpu className="h-3.5 w-3.5 text-accent" /> Run Digital Twin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scenario engine Simulation */}
      {showSimulation && (
        <div
          ref={simulationRef}
          className="bg-white border-2 border-primary shadow-2xl p-6 relative rounded-sm animate-fadeIn"
        >
          <div className="absolute top-0 left-0 bg-primary text-white text-[9px] font-bold px-3.5 py-1 uppercase tracking-widest">
            AI Scenario Engine Simulation
          </div>
          
          <h3 className="text-sm md:text-base font-extrabold text-gray-900 mt-6 mb-4 font-outfit uppercase border-b pb-2">
            SIMULATION REPORT — Halt Jajmau Tannery Discharge for 5 Days:
          </h3>

          {simulating ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="animate-spin text-primary h-8 w-8 mb-2" />
              <p className="text-xs text-gray-500 uppercase font-bold">Computing outcomes...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm text-left border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 border-r border-b">Parameter</th>
                      <th className="px-4 py-3 border-r border-b">Before</th>
                      <th className="px-4 py-3 border-r border-b">Expected After 5 Days</th>
                      <th className="px-4 py-3 border-b text-center font-extrabold">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium">
                    <tr>
                      <td className="px-4 py-3 border-r font-bold text-gray-950">Biochemical Oxygen Demand (BOD)</td>
                      <td className="px-4 py-3 border-r text-alert-red font-bold">
                        {simulationData?.beforeValues?.bodLevel} mg/L
                      </td>
                      <td className="px-4 py-3 border-r text-safe-green font-bold">
                        {simulationData?.afterValues?.bodLevel} mg/L
                      </td>
                      <td className="px-4 py-3 text-safe-green font-black bg-green-50 text-center">
                        -{simulationData?.bodReduction}% Reduction
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-r font-bold text-gray-950">Fish Kill Probability</td>
                      <td className="px-4 py-3 border-r text-alert-red font-bold">
                        {simulationData?.beforeValues?.fishKillRisk}%
                      </td>
                      <td className="px-4 py-3 border-r text-safe-green font-bold">
                        {simulationData?.afterValues?.fishKillRisk}%
                      </td>
                      <td className="px-4 py-3 text-safe-green font-black bg-green-50 text-center">
                        -{simulationData?.fishKillReduction}% Risk Decrease
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-r font-bold text-gray-950">Dolphin Habitat Quality</td>
                      <td className="px-4 py-3 border-r text-alert-red font-bold">
                        {simulationData?.beforeValues?.dolphinHabitatRisk}
                      </td>
                      <td className="px-4 py-3 border-r text-orange-500 font-bold">
                        {simulationData?.afterValues?.dolphinHabitatRisk}
                      </td>
                      <td className="px-4 py-3 text-safe-green font-black bg-green-50 text-center uppercase">
                        Improved
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSimulation(false);
                    toast.success('Digital Twin simulation suspended.');
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  Close Simulator
                </button>
                <button
                  onClick={() => toast.success('Simulated policy orders issued to regional inspectors.')}
                  className="px-4 py-2 bg-safe-green hover:bg-safe-green/90 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow transition-colors cursor-pointer"
                >
                  Enforce Policy Halt
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
