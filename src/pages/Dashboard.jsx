import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Fish, MapPin, Eye, FileText, CheckCircle, Sliders } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [citizenReports, setCitizenReports] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('ganga_guardian_citizen_reports');
    if (saved) {
      try {
        setCitizenReports(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleActionClick = (actionName) => {
    alert(`Executing priority protocol: "${actionName}"...\nCommand dispatched to NMCG field units.`);
  };

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* River Health Index Dial */}
        <div className="lg:col-span-3 bg-white p-6 border border-gray-200 shadow-sm flex flex-col items-center justify-between rounded-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center w-full border-b pb-2">
            River Health Index
          </h2>
          <div className="relative w-44 h-44 mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#dc2626"
                strokeWidth="8"
                strokeDasharray={`${34 * 2.827} 282.7`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-gray-900 font-outfit">34</span>
              <span className="text-[10px] text-gray-400 font-bold">/100</span>
            </div>
          </div>
          <div className="text-center w-full space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Kanpur Monitoring Zone
            </p>
            <div className="inline-block bg-red-50 text-alert-red border border-red-200 px-3 py-1 rounded-[3px] text-[10px] font-black tracking-widest uppercase">
              CRITICAL
            </div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider pt-3 border-t border-gray-100 w-full block">
              Last updated: Today, 14:32 IST
            </p>
          </div>
        </div>

        {/* Live SVG Map */}
        <div className="lg:col-span-6 bg-white border border-gray-200 shadow-sm flex flex-col rounded-sm">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
              Live Monitoring Stations — Ganga Basin
            </h2>
            <span className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 mr-1 text-primary" /> GIS Data
            </span>
          </div>
          <div className="flex-1 bg-gray-950 relative min-h-[360px] overflow-hidden">
            {/* Grid Map Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(#33333340_1px,transparent_1px),linear-gradient(90deg,#33333340_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            {/* Simulated River Path SVG */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 0,25 Q 30,35 50,55 T 100,75" fill="none" stroke="#1e3a8a" strokeWidth="3" opacity="0.6" />
            </svg>

            {/* Kanpur Pin */}
            <div className="absolute top-[32%] left-[30%] group">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-alert-red border-2 border-white shadow-lg"></span>
              </div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-[10px] font-bold text-gray-900 shadow-lg border-l-4 border-alert-red whitespace-nowrap">
                Kanpur (BOD: 48)
              </div>
            </div>

            {/* Prayagraj Pin */}
            <div className="absolute top-[48%] left-[55%]">
              <div className="h-3.5 w-3.5 bg-accent rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-[10px] font-bold text-gray-900 shadow-lg border-l-4 border-accent whitespace-nowrap">
                Prayagraj (BOD: 22)
              </div>
            </div>

            {/* Varanasi Pin */}
            <div className="absolute top-[68%] left-[75%]">
              <div className="h-3.5 w-3.5 bg-yellow-400 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-[10px] font-bold text-gray-900 shadow-lg border-l-4 border-yellow-400 whitespace-nowrap">
                Varanasi (BOD: 18)
              </div>
            </div>
          </div>
        </div>

        {/* Forecasts Panel */}
        <div className="lg:col-span-3 bg-white border border-gray-200 shadow-sm flex flex-col rounded-sm">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
              5-Day BOD Forecast
            </h2>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-700">
              <thead className="text-[10px] uppercase bg-gray-100 border-b text-gray-600 font-bold">
                <tr>
                  <th className="px-3 py-2.5 border-r">Day</th>
                  <th className="px-3 py-2.5 border-r">BOD</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr className="bg-red-50/20">
                  <td className="px-3 py-2.5 border-r font-bold text-gray-950">Today</td>
                  <td className="px-3 py-2.5 border-r font-extrabold text-alert-red">48 mg/L</td>
                  <td className="px-3 py-2.5 text-[9px] font-black text-alert-red uppercase">CRITICAL</td>
                </tr>
                <tr className="bg-red-50/20">
                  <td className="px-3 py-2.5 border-r text-gray-600">+1 Day</td>
                  <td className="px-3 py-2.5 border-r font-extrabold text-alert-red">52 mg/L</td>
                  <td className="px-3 py-2.5 text-[9px] font-black text-alert-red uppercase">CRITICAL</td>
                </tr>
                <tr className="bg-red-50/10">
                  <td className="px-3 py-2.5 border-r text-gray-600">+2 Day</td>
                  <td className="px-3 py-2.5 border-r font-extrabold text-alert-red">47 mg/L</td>
                  <td className="px-3 py-2.5 text-[9px] font-black text-alert-red uppercase">CRITICAL</td>
                </tr>
                <tr className="bg-orange-50/30">
                  <td className="px-3 py-2.5 border-r text-gray-600">+3 Day</td>
                  <td className="px-3 py-2.5 border-r font-extrabold text-orange-600">41 mg/L</td>
                  <td className="px-3 py-2.5 text-[9px] font-black text-orange-600 uppercase">WARNING</td>
                </tr>
                <tr className="bg-orange-50/10">
                  <td className="px-3 py-2.5 border-r text-gray-600">+4 Day</td>
                  <td className="px-3 py-2.5 border-r font-extrabold text-orange-600">35 mg/L</td>
                  <td className="px-3 py-2.5 text-[9px] font-black text-orange-600 uppercase">WARNING</td>
                </tr>
                <tr className="bg-green-50/20">
                  <td className="px-3 py-2.5 border-r text-gray-600">+5 Day</td>
                  <td className="px-3 py-2.5 border-r font-extrabold text-safe-green">29 mg/L</td>
                  <td className="px-3 py-2.5 text-[9px] font-black text-safe-green uppercase">IMPROVING</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Biodiversity Risk Assessment */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-4 flex items-center font-outfit uppercase tracking-wide">
          <Fish className="mr-2 h-4 w-4" /> Biodiversity Risk Assessment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-5 shadow-sm flex items-start space-x-4 rounded-sm">
            <div className="bg-red-100 p-3 rounded text-alert-red shrink-0">
              <Fish className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm font-outfit uppercase">Gangetic Dolphin</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Status: Endangered</p>
              <div className="inline-block bg-alert-red text-white text-[9px] font-black px-2 py-0.5 mt-3 uppercase rounded-sm tracking-wider">
                Habitat Risk: HIGH
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 shadow-sm flex items-start space-x-4 rounded-sm">
            <div className="bg-red-950 p-3 rounded text-white shrink-0">
              <Fish className="h-6 w-6 text-red-300" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm font-outfit uppercase">Hilsa Fish</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Status: Vulnerable</p>
              <div className="inline-block bg-red-950 text-white text-[9px] font-black px-2 py-0.5 mt-3 uppercase rounded-sm tracking-wider">
                Habitat Risk: CRITICAL
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 shadow-sm flex items-start space-x-4 rounded-sm">
            <div className="bg-orange-100 p-3 rounded text-orange-600 shrink-0">
              <Fish className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm font-outfit uppercase">Gharial</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Status: Critically Endangered</p>
              <div className="inline-block bg-accent text-white text-[9px] font-black px-2 py-0.5 mt-3 uppercase rounded-sm tracking-wider">
                Habitat Risk: ALERT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-sm">
        <div className="bg-primary px-4 py-3 text-left">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest font-outfit">
            Automated Action Recommendations
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700">
            <thead className="text-[10px] uppercase bg-gray-150 border-b text-gray-600 font-bold">
              <tr>
                <th className="px-4 py-3 border-r">Priority</th>
                <th className="px-4 py-3 border-r">Action</th>
                <th className="px-4 py-3 border-r">Est. Cost</th>
                <th className="px-4 py-3 border-r">Expected Impact</th>
                <th className="px-4 py-3 border-r">Timeline</th>
                <th className="px-4 py-3 text-center">Execute</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium">
              <tr className="border-b bg-red-50/20">
                <td className="px-4 py-3 border-r font-extrabold text-alert-red">1</td>
                <td className="px-4 py-3 border-r font-bold text-gray-900">
                  Shut Jajmau tannery cluster discharge
                </td>
                <td className="px-4 py-3 border-r text-gray-500">₹0 (Regulatory)</td>
                <td className="px-4 py-3 border-r font-extrabold text-green-700">BOD -35%</td>
                <td className="px-4 py-3 border-r text-gray-600">48 hours</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleActionClick('Shut Jajmau tannery cluster discharge')}
                    className="bg-alert-red hover:bg-alert-red/90 text-white font-bold px-3 py-1 rounded-[3px] text-[10px] tracking-wide uppercase transition-colors cursor-pointer"
                  >
                    Deploy
                  </button>
                </td>
              </tr>
              <tr className="border-b bg-gray-50/40">
                <td className="px-4 py-3 border-r font-bold text-orange-500">2</td>
                <td className="px-4 py-3 border-r font-bold text-gray-900">
                  Activate Kanpur STP overflow bypass
                </td>
                <td className="px-4 py-3 border-r text-gray-500">₹12 Lakhs</td>
                <td className="px-4 py-3 border-r font-extrabold text-green-700">DO +40%</td>
                <td className="px-4 py-3 border-r text-gray-600">24 hours</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleActionClick('Activate Kanpur STP overflow bypass')}
                    className="bg-primary hover:bg-primary/95 text-white font-bold px-3 py-1 rounded-[3px] text-[10px] tracking-wide uppercase transition-colors cursor-pointer"
                  >
                    Deploy
                  </button>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 border-r font-bold text-yellow-500">3</td>
                <td className="px-4 py-3 border-r font-bold text-gray-900">
                  Deploy emergency aerators — Varanasi
                </td>
                <td className="px-4 py-3 border-r text-gray-500">₹8 Lakhs</td>
                <td className="px-4 py-3 border-r font-extrabold text-green-700">DO +20%</td>
                <td className="px-4 py-3 border-r text-gray-600">6 hours</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleActionClick('Deploy emergency aerators — Varanasi')}
                    className="bg-primary hover:bg-primary/95 text-white font-bold px-3 py-1 rounded-[3px] text-[10px] tracking-wide uppercase transition-colors cursor-pointer"
                  >
                    Deploy
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderMap = () => (
    <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
      <h2 className="text-base font-bold text-primary mb-2 font-outfit uppercase">Expanded Basin GIS Map</h2>
      <p className="text-xs text-gray-400 mb-6 font-medium uppercase tracking-wider">CPCB Telemetry Stations & Active Citizen Incidents</p>
      
      {/* expanded map view */}
      <div className="bg-gray-950 min-h-[500px] relative overflow-hidden rounded-sm border border-gray-800">
        <div className="absolute inset-0 bg-[linear-gradient(#222_1px,transparent_1px),linear-gradient(90deg,#222_1px,transparent_1px)] bg-[size:30px_30px] opacity-40"></div>
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M 0,25 Q 30,35 50,55 T 100,75" fill="none" stroke="#1d4ed8" strokeWidth="4" opacity="0.6" />
        </svg>

        <div className="absolute top-[32%] left-[30%] text-center">
          <span className="relative flex h-5 w-5 mx-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-alert-red border-2 border-white shadow-xl"></span>
          </span>
          <div className="bg-white p-2.5 rounded shadow-lg border border-gray-200 mt-2 text-left w-48 text-[10px] leading-relaxed">
            <p className="font-bold text-gray-900 border-b pb-1 text-xs">KANPUR CENTRAL</p>
            <p className="mt-1 text-red-600 font-extrabold">BOD: 48 mg/L (Critical)</p>
            <p className="text-gray-500">DO: 2.1 mg/L (Deficient)</p>
            <p className="text-gray-500">Turbidity: 18 NTU (Elevated)</p>
          </div>
        </div>

        <div className="absolute top-[48%] left-[55%] text-center">
          <span className="relative flex h-4.5 w-4.5 mx-auto">
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-accent border-2 border-white shadow-xl"></span>
          </span>
          <div className="bg-white p-2.5 rounded shadow-lg border border-gray-200 mt-2 text-left w-48 text-[10px] leading-relaxed">
            <p className="font-bold text-gray-900 border-b pb-1 text-xs">PRAYAGRAJ SANGAM</p>
            <p className="mt-1 text-orange-600 font-extrabold">BOD: 22 mg/L (Warning)</p>
            <p className="text-gray-500">DO: 5.4 mg/L (Optimal)</p>
            <p className="text-gray-500">Turbidity: 8 NTU (Moderate)</p>
          </div>
        </div>

        <div className="absolute top-[68%] left-[75%] text-center">
          <span className="relative flex h-4.5 w-4.5 mx-auto">
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-yellow-400 border-2 border-white shadow-xl"></span>
          </span>
          <div className="bg-white p-2.5 rounded shadow-lg border border-gray-200 mt-2 text-left w-48 text-[10px] leading-relaxed">
            <p className="font-bold text-gray-900 border-b pb-1 text-xs">VARANASI GHATS</p>
            <p className="mt-1 text-yellow-600 font-extrabold">BOD: 18 mg/L (Moderate)</p>
            <p className="text-gray-500">DO: 4.8 mg/L (Safe)</p>
            <p className="text-gray-500">Turbidity: 14 NTU (Elevated)</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-[calc(100vh-140px)]">
      {/* Sub Header tabs bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto whitespace-nowrap">
            {['Overview', 'Pollution Map', 'AI Alerts', 'Biodiversity', 'Reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'AI Alerts') {
                    onNavigate('/alerts');
                  } else if (tab === 'Biodiversity') {
                    onNavigate('/biodiversity');
                  } else if (tab === 'Reports') {
                    onNavigate('/reports');
                  } else {
                    setActiveSubTab(tab);
                  }
                }}
                className={`px-6 py-4.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  activeSubTab === tab && (tab === 'Overview' || tab === 'Pollution Map')
                    ? 'text-primary border-b-3 border-primary bg-gray-50/50'
                    : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main dashboard content container */}
      <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-10">
        {activeSubTab === 'Overview' && renderOverview()}
        {activeSubTab === 'Pollution Map' && renderMap()}
      </div>
    </div>
  );
}
