import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Sliders, Cpu, BarChart3, AlertCircle, Play } from 'lucide-react';
import { api } from '../utils/api';

export default function DigitalTwin() {
  const [haltTanneries, setHaltTanneries] = useState(false);
  const [stpBypass, setStpBypass] = useState(false);
  const [aerators, setAerators] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  const buildFallbackSimulation = (inputs) => {
    const bodBefore = 28 + (inputs.stpBypass ? 4 : 0);
    const bodAfter = Math.max(8, bodBefore - (inputs.haltTanneries ? 14 : 4) - (inputs.aerators ? 3 : 0));
    const fishBefore = 72 + (inputs.stpBypass ? 6 : 0);
    const fishAfter = Math.max(16, fishBefore - (inputs.haltTanneries ? 24 : 7) - (inputs.aerators ? 4 : 0));

    return {
      beforeValues: {
        bodLevel: bodBefore,
        fishKillRisk: fishBefore,
        dolphinHabitatRisk: inputs.haltTanneries ? 'High Risk' : 'Elevated Risk'
      },
      afterValues: {
        bodLevel: bodAfter,
        fishKillRisk: fishAfter,
        dolphinHabitatRisk: inputs.haltTanneries ? 'Moderate' : 'Elevated'
      },
      bodReduction: Math.max(10, Math.round(((bodBefore - bodAfter) / bodBefore) * 100)),
      fishKillReduction: Math.max(12, Math.round(((fishBefore - fishAfter) / fishBefore) * 100))
    };
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const response = await api.post('/digital-twin/simulate', {
        haltTanneries,
        stpBypass,
        aerators
      });
      setSimulationData(response.simulation || buildFallbackSimulation({ haltTanneries, stpBypass, aerators }));
      setShowResults(true);
    } catch (e) {
      const fallbackSimulation = buildFallbackSimulation({ haltTanneries, stpBypass, aerators });
      setSimulationData(fallbackSimulation);
      setShowResults(true);
      toast.error('Simulation service unavailable; showing a local fallback scenario.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10 min-h-screen text-left">
      {/* Title */}
      <div className="border-b-2 border-primary pb-4 mb-8">
        <h1 className="text-xl md:text-2xl font-black text-primary uppercase tracking-wide font-outfit">
          Digital Twin Policy Simulator
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          Simulate basin policy outcomes before active deployment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Toggles */}
        <div className="lg:col-span-4 bg-white border border-gray-200 p-6 shadow-sm rounded-sm space-y-6">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" /> Intervention Controls
          </h2>
          
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Halt Jajmau Tanneries</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Kanpur Industrial Cluster</p>
              </div>
              <input
                type="checkbox"
                checked={haltTanneries}
                onChange={(e) => setHaltTanneries(e.target.checked)}
                className="h-4.5 w-4.5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">STP Overflow Bypass</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Varanasi Sewer Diversion</p>
              </div>
              <input
                type="checkbox"
                checked={stpBypass}
                onChange={(e) => setStpBypass(e.target.checked)}
                className="h-4.5 w-4.5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Emergency Aerators</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Varanasi Bathing Ghats</p>
              </div>
              <input
                type="checkbox"
                checked={aerators}
                onChange={(e) => setAerators(e.target.checked)}
                className="h-4.5 w-4.5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-sm shadow-md transition-colors uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-primary/70"
          >
            {isSimulating ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                <span>Computing Models...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-accent" />
                <span>Run Policy Twin</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8 space-y-6">
          {!showResults && !isSimulating ? (
            <div className="bg-gray-50 border border-gray-200 border-dashed p-16 text-center rounded-sm">
              <Cpu className="h-10 w-10 text-gray-500 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Awaiting Simulation Configuration</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Adjust the toggle controls on the left to halt industrial effluents or manage STPs, then click "Run Policy Twin" to view simulated data.
              </p>
            </div>
          ) : isSimulating ? (
            <div className="bg-white border border-gray-200 p-16 text-center rounded-sm shadow-sm flex flex-col justify-center items-center min-h-[300px]">
              <div className="h-10 w-10 border-[3px] border-primary border-t-accent rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Resolving LSTM Neural Net Parameters...</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-sm space-y-6 animate-fadeIn">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Projected Analytical Outcomes
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* BOD result */}
                <div className="bg-gray-50 p-4 border border-gray-150 rounded-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">BOD Level</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-gray-400 line-through font-bold text-xs">{simulationData?.beforeValues?.bodLevel} mg/L</span>
                    <span className="text-safe-green font-extrabold text-lg">{simulationData?.afterValues?.bodLevel} mg/L</span>
                  </div>
                  <div className="text-[9px] font-bold text-safe-green uppercase mt-2">
                    {simulationData?.bodReduction}% Decrease
                  </div>
                </div>

                {/* Fish Kill result */}
                <div className="bg-gray-50 p-4 border border-gray-150 rounded-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fish Kill Risk</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-gray-400 line-through font-bold text-xs">{simulationData?.beforeValues?.fishKillRisk}%</span>
                    <span className="text-safe-green font-extrabold text-lg">{simulationData?.afterValues?.fishKillRisk}%</span>
                  </div>
                  <div className="text-[9px] font-bold text-safe-green uppercase mt-2">
                    {simulationData?.fishKillReduction}% Risk Reduction
                  </div>
                </div>

                {/* Dolphin Risk result */}
                <div className="bg-gray-50 p-4 border border-gray-150 rounded-sm">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dolphin Habitat Risk</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-gray-400 line-through font-bold text-xs">{simulationData?.beforeValues?.dolphinHabitatRisk}</span>
                    <span className="text-safe-green font-extrabold text-lg uppercase">{simulationData?.afterValues?.dolphinHabitatRisk}</span>
                  </div>
                  <div className="text-[9px] font-bold text-safe-green uppercase mt-2">
                    Status Improved
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4.5 rounded-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wide">Simulation Guidelines Notice</h4>
                  <p className="text-xs text-orange-900 leading-normal mt-1">
                    Closing the tannery cluster reduces chromium load significantly, but also yields localized economic impacts. STP bypass triggers temporary high organic loading downstream. Verify with municipal guidelines before execution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
