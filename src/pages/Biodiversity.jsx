import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Fish, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { getRiskStyle } from '../utils/styles';

export default function Biodiversity() {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSpecies = async () => {
    try {
      setLoading(true);
      const data = await api.get('/species-alerts');
      setSpecies(data);
    } catch (e) {
      setSpecies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecies();
  }, []);


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
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary h-12 w-12" />
        </div>
      ) : species.length === 0 ? (
        <div className="bg-white border border-gray-250 p-12 text-center rounded-sm">
          <Fish className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-700 uppercase">No species alerts</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {species.map((s, idx) => (
            <div key={s._id || idx} className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-[3px] text-[10px] font-black tracking-wider G G-wider uppercase ${getRiskStyle(s.riskLevel)}`}>
                    {s.riskLevel} RISK
                  </span>
                  <span className="text-xs text-gray-400 font-bold uppercase">{s.scientificName || s.conservationStatus}</span>
                </div>
                
                <h2 className="text-lg font-bold text-gray-900 font-outfit uppercase flex items-center gap-2">
                  <Fish className="h-5 w-5 text-primary" /> {s.speciesName}
                </h2>
                
                <div className="text-xs space-y-1.5 text-gray-600 font-medium">
                  <p><strong className="text-gray-800">Critical Habitat:</strong> {s.habitat}</p>
                  <p><strong className="text-gray-800">Primary Stressors:</strong> {s.threats}</p>
                  <p><strong className="text-gray-800">Telemetry Status:</strong> {s.population}</p>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-row md:flex-col gap-3 justify-end items-center border-t md:border-t-0 pt-4 md:pt-0">
                <button
                  onClick={() => toast.success(`Opening telemetry maps for ${s.speciesName}...`)}
                  className="w-full md:w-auto bg-primary hover:bg-primary/95 text-white font-bold px-4 py-2 text-xs rounded-sm shadow-sm transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Track Species
                </button>
                <button
                  onClick={() => toast.success(`Opening environmental impact reports for ${s.speciesName}...`)}
                  className="w-full md:w-auto border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold px-4 py-2 text-xs rounded-sm transition-colors uppercase tracking-wider cursor-pointer bg-white"
                >
                  Habitat metrics
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
