import React, { useState, useRef } from 'react';
import { AlertCircle, ShieldAlert, Cpu, Eye, FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function AIAlerts({ onNavigate }) {
  const [activeAlertsCount, setActiveAlertsCount] = useState(3);
  const [showSimulation, setShowSimulation] = useState(false);
  const [notifiedItems, setNotifiedItems] = useState({});
  const simulationRef = useRef(null);

  const handleAction = (alertId, actionName) => {
    setNotifiedItems(prev => ({
      ...prev,
      [`${alertId}-${actionName}`]: true
    }));
    alert(`Action initiated: "${actionName}" for Alert #${alertId}.\nNotifications dispatched to regional enforcement units.`);
  };

  const triggerSimulation = () => {
    setShowSimulation(true);
    setTimeout(() => {
      simulationRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10 min-h-screen text-left">
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
          <span>{activeAlertsCount} Active Alerts</span>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-6 mb-12">
        {/* Alert 1 */}
        <div className="bg-white border border-gray-200 border-l-4 border-l-alert-red shadow-md rounded-r-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-alert-red text-white text-[9px] font-black px-2 py-0.5 rounded-sm tracking-wider uppercase">
                    CRITICAL
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Confidence: 80% | Detected: 2 hours ago
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 font-outfit uppercase">
                  Chromium Contamination Detected
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Source: Jajmau Tannery Cluster, Kanpur | Chemical: Hexavalent Chromium (Cr⁶⁺)
                </p>
              </div>
              <ShieldAlert className="text-alert-red h-8 w-8 shrink-0 opacity-85" />
            </div>

            <div className="bg-gray-50 p-3.5 border border-gray-150 rounded flex gap-8">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">BOD Level</span>
                <div className="font-bold text-alert-red text-sm">
                  48 mg/L <span className="text-[10px] text-gray-400 font-semibold">(Limit: 3 mg/L)</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">DO Level</span>
                <div className="font-bold text-alert-red text-sm">
                  2.1 mg/L <span className="text-[10px] text-gray-400 font-semibold">(Safe: &gt;4 mg/L)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => handleAction('1', 'Notify Factory')}
                className={`text-xs font-bold px-4 py-2 rounded-sm shadow-sm transition-all uppercase tracking-wider cursor-pointer ${
                  notifiedItems['1-Notify Factory']
                    ? 'bg-green-700 text-white cursor-default'
                    : 'bg-primary hover:bg-primary/95 text-white'
                }`}
              >
                {notifiedItems['1-Notify Factory'] ? 'Notified ✓' : 'Notify Factory'}
              </button>
              <button
                onClick={() => handleAction('1', 'Escalate to CPCB')}
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

        {/* Alert 2 */}
        <div className="bg-white border border-gray-200 border-l-4 border-l-accent shadow-md rounded-r-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-accent text-white text-[9px] font-black px-2 py-0.5 rounded-sm tracking-wider uppercase">
                    WARNING
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Confidence: 73% | Detected: 5 hours ago
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 font-outfit uppercase">
                  Sewage Surge — Allahabad Junction
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Source: Municipal Sewage Overflow | Raw municipal organic overload
                </p>
              </div>
              <AlertCircle className="text-accent h-8 w-8 shrink-0 opacity-85" />
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => handleAction('2', 'Notify Municipal Corp')}
                className={`text-xs font-bold px-4 py-2 rounded-sm shadow-sm transition-all uppercase tracking-wider cursor-pointer ${
                  notifiedItems['2-Notify Municipal Corp']
                    ? 'bg-green-700 text-white cursor-default'
                    : 'bg-primary hover:bg-primary/95 text-white'
                }`}
              >
                {notifiedItems['2-Notify Municipal Corp'] ? 'Notified ✓' : 'Notify Municipal Corp'}
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

        {/* Alert 3 */}
        <div className="bg-white border border-gray-200 border-l-4 border-l-yellow-400 shadow-md rounded-r-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-yellow-400 text-gray-900 text-[9px] font-black px-2 py-0.5 rounded-sm tracking-wider uppercase">
                    MODERATE
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Confidence: 65% | Detected: 8 hours ago
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 font-outfit uppercase">
                  Elevated Turbidity — Varanasi Ghat
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Source: Monsoon runoff + upstream soil discharge
                </p>
              </div>
              <AlertCircle className="text-yellow-400 h-8 w-8 shrink-0 opacity-85" />
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => alert('Opening full turbidity research dossier...')}
                className="border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold px-4 py-2 rounded-sm transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-primary" /> View report
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  <td className="px-4 py-3 border-r text-alert-red font-bold">61 mg/L</td>
                  <td className="px-4 py-3 border-r text-safe-green font-bold">38 mg/L</td>
                  <td className="px-4 py-3 text-safe-green font-black bg-green-50 text-center">-38% Reduction</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-r font-bold text-gray-950">Fish Kill Probability</td>
                  <td className="px-4 py-3 border-r text-alert-red font-bold">70%</td>
                  <td className="px-4 py-3 border-r text-safe-green font-bold">15%</td>
                  <td className="px-4 py-3 text-safe-green font-black bg-green-50 text-center">-55% Risk Decrease</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-r font-bold text-gray-950">Dolphin Habitat Quality</td>
                  <td className="px-4 py-3 border-r text-alert-red font-bold">HIGH RISK</td>
                  <td className="px-4 py-3 border-r text-orange-500 font-bold">MODERATE RISK</td>
                  <td className="px-4 py-3 text-safe-green font-black bg-green-50 text-center uppercase">Improved</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setShowSimulation(false);
                alert('Digital Twin simulation suspended.');
              }}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
            >
              Close Simulator
            </button>
            <button
              onClick={() => alert('Simulated policy orders issued to regional inspectors.')}
              className="px-4 py-2 bg-safe-green hover:bg-safe-green/90 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow transition-colors cursor-pointer"
            >
              Enforce Policy Halt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
