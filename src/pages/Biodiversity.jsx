import React from 'react';
import { Fish, ShieldAlert, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';

export default function Biodiversity() {
  const species = [
    {
      name: 'Gangetic Dolphin (Platanista gangetica)',
      status: 'Endangered',
      risk: 'HIGH RISK',
      riskStyle: 'bg-alert-red text-white',
      habitat: 'Kanpur to Prayagraj deep pool stretches',
      threats: 'Bioaccumulation of chromium, industrial noise, STP overflows',
      population: 'Estimated 2,500 - 3,000 remaining in basin'
    },
    {
      name: 'Hilsa Fish (Tenualosa ilisha)',
      status: 'Varanasi Passage Restricted',
      risk: 'CRITICAL',
      riskStyle: 'bg-red-950 text-white',
      habitat: 'Estuary spawning grounds up to Farakka Barrage',
      threats: 'High BOD blockage, heavy municipal organic loads',
      population: 'Declining migrations recorded annually'
    },
    {
      name: 'Gharial (Gavialis gangeticus)',
      status: 'Critically Endangered',
      risk: 'ALERT',
      riskStyle: 'bg-accent text-white',
      habitat: 'Chambal tributary confluence stretches',
      threats: 'River bed mining, industrial runoff spikes',
      population: 'High sandbar telemetry monitoring active'
    }
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10 min-h-screen text-left">
      {/* Title */}
      <div className="border-b-2 border-primary pb-4 mb-8">
        <h1 className="text-xl md:text-2xl font-black text-primary uppercase tracking-wide font-outfit">
          Biodiversity Intelligence Network
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          Real-time threat assessments for critical river ecosystems
        </p>
      </div>

      {/* Grid */}
      <div className="space-y-6">
        {species.map((s, idx) => (
          <div key={idx} className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-[3px] text-[10px] font-black tracking-wider uppercase ${s.riskStyle}`}>
                  {s.risk}
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase">{s.status}</span>
              </div>
              
              <h2 className="text-lg font-bold text-gray-900 font-outfit uppercase flex items-center gap-2">
                <Fish className="h-5 w-5 text-primary" /> {s.name}
              </h2>
              
              <div className="text-xs space-y-1.5 text-gray-600 font-medium">
                <p><strong className="text-gray-800">Critical Habitat:</strong> {s.habitat}</p>
                <p><strong className="text-gray-800">Primary Stressors:</strong> {s.threats}</p>
                <p><strong className="text-gray-800">Telemetry Status:</strong> {s.population}</p>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-row md:flex-col gap-3 justify-end items-center border-t md:border-t-0 pt-4 md:pt-0">
              <button
                onClick={() => alert(`Opening telemetry maps for ${s.name}...`)}
                className="w-full md:w-auto bg-primary hover:bg-primary/95 text-white font-bold px-4 py-2 text-xs rounded-sm shadow-sm transition-colors uppercase tracking-wider cursor-pointer"
              >
                Track Species
              </button>
              <button
                onClick={() => alert(`Opening environmental impact reports for ${s.name}...`)}
                className="w-full md:w-auto border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold px-4 py-2 text-xs rounded-sm transition-colors uppercase tracking-wider cursor-pointer bg-white"
              >
                Habitat metrics
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
