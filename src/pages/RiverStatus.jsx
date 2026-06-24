import React from 'react';
import { Activity, ShieldCheck, HelpCircle, Thermometer } from 'lucide-react';

export default function RiverStatus() {
  const parameters = [
    { name: 'pH Level', value: '7.8', limit: '6.5 - 8.5', status: 'Optimal', statusStyle: 'text-green-700 bg-green-50 border-green-200', desc: 'Measures acidity or alkalinity. Safe range sustains aquatic life.' },
    { name: 'Dissolved Oxygen (DO)', value: '4.2 mg/L', limit: 'Above 5.0 mg/L', status: 'Marginal', statusStyle: 'text-orange-700 bg-orange-50 border-orange-200', desc: 'Amount of oxygen available to fish and plants. Low levels stress biology.' },
    { name: 'Biochemical Oxygen Demand (BOD)', value: '18 mg/L', limit: 'Below 3.0 mg/L', status: 'Critical', statusStyle: 'text-red-700 bg-red-50 border-red-200', desc: 'Oxygen needed to decompose organic matter. High BOD implies high sewage/organic loading.' },
    { name: 'Turbidity', value: '14 NTU', limit: 'Below 5.0 NTU', status: 'Elevated', statusStyle: 'text-orange-700 bg-orange-50 border-orange-200', desc: 'Water clarity measure. High turbidity blocks sunlight, indicating runoff or mud loading.' },
    { name: 'Fecal Coliform', value: '8,500 MPN', limit: 'Below 500 MPN', status: 'Severe', statusStyle: 'text-red-700 bg-red-50 border-red-200', desc: 'Sewage-indicator bacteria. High counts indicate raw municipal discharge, unsafe for bathing.' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-left min-h-[calc(100vh-200px)]">
      {/* Title */}
      <div className="border-b pb-4 mb-8">
        <h1 className="text-2xl font-black text-primary font-outfit uppercase">
          Basin River Status
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          Real-time water quality indices from physical monitoring stations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Param list */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-gray-900 font-outfit uppercase mb-4 tracking-wide">
            Water Quality Parameter Breakdown
          </h2>
          <div className="space-y-4">
            {parameters.map((param, i) => (
              <div key={i} className="bg-white border border-gray-200 p-5.5 rounded-sm shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-gray-300 transition-colors">
                <div className="space-y-1.5 max-w-md">
                  <h3 className="font-bold text-gray-950 text-sm font-outfit uppercase flex items-center gap-1.5">
                    {param.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-normal">{param.desc}</p>
                </div>
                
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2">
                  <div>
                    <span className="text-base font-extrabold text-gray-900 font-outfit">{param.value}</span>
                    <span className="text-[10px] text-gray-400 font-bold block">Limit: {param.limit}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-[3px] text-[10px] font-bold border uppercase tracking-wider ${param.statusStyle}`}>
                    {param.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ghat stats summary */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-gray-900 font-outfit uppercase mb-4 tracking-wide">
            Monitoring Stations State
          </h2>
          
          <div className="bg-white border border-gray-250 p-6 rounded-sm shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b pb-3.5">
              <div>
                <h3 className="font-bold text-gray-900 text-sm font-outfit uppercase">Kanpur Ghats</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Heavy industrial cluster</p>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-extrabold border border-red-200 tracking-wider">
                CRITICAL (34)
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-3.5">
              <div>
                <h3 className="font-bold text-gray-900 text-sm font-outfit uppercase">Prayagraj Sangam</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Pilgrimage node</p>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-extrabold border border-orange-200 tracking-wider">
                WARNING (58)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-sm font-outfit uppercase">Varanasi Ghats</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Tourism & ritual site</p>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[10px] font-extrabold border border-yellow-200 tracking-wider">
                MODERATE (64)
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
