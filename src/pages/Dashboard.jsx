import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Fish, MapPin, Eye, FileText, CheckCircle, Sliders, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { getRiskStyle } from '../utils/styles';

export default function Dashboard({ onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [selectedLocation, setSelectedLocation] = useState('Kanpur-Jajmau');
  
  // Data states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [riverHealth, setRiverHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [forecast, setForecast] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(true);
  const [species, setSpecies] = useState([]);
  const [loadingSpecies, setLoadingSpecies] = useState(true);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [sensorReadings, setSensorReadings] = useState([]);
  const [loadingSensors, setLoadingSensors] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      const data = await api.get('/dashboard/stats');
      setStats(data);
    } catch (e) {
      console.error('Stats loading failed', e);
      setStats({
        untreatedSewage: '2.8 Billion L',
        pollutingIndustries: '1,240+',
        alertLatency: '6–12 Hrs',
        historicBudget: '₹20,000 Cr',
        monitoringLocations: 3,
        locationData: []
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRiverHealth = async (loc) => {
    try {
      setLoadingHealth(true);
      const data = await api.get(`/dashboard/river-health/${loc}`);
      setRiverHealth(data);
    } catch (e) {
      console.error('River health loading failed', e);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchForecast = async (loc) => {
    try {
      setLoadingForecast(true);
      const data = await api.get(`/predictions/${loc}`);
      setForecast(data.forecastDays || []);
    } catch (e) {
      console.error('Forecast loading failed', e);
      setForecast([
        { day: 'Today', bodValue: 22, status: 'WARNING' },
        { day: '+1 Day', bodValue: 20, status: 'WARNING' },
        { day: '+2 Day', bodValue: 18, status: 'MODERATE' },
        { day: '+3 Day', bodValue: 15, status: 'MODERATE' },
        { day: '+4 Day', bodValue: 14, status: 'IMPROVING' }
      ]);
    } finally {
      setLoadingForecast(false);
    }
  };

  const fetchSpecies = async () => {
    try {
      setLoadingSpecies(true);
      const data = await api.get('/species-alerts');
      setSpecies(data);
    } catch (e) {
      console.error('Species loading failed', e);
    } finally {
      setLoadingSpecies(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const data = await api.get('/reports');
      setReports(data);
    } catch (e) {
      console.error('Reports loading failed', e);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchSensorReadings = async (loc) => {
    try {
      setLoadingSensors(true);
      const data = await api.get(`/dashboard/sensor-readings/${loc}?days=5`);
      setSensorReadings(data);
    } catch (e) {
      console.error('Sensor readings failed', e);
    } finally {
      setLoadingSensors(false);
    }
  };

  const fetchRecommendations = async (loc) => {
    try {
      setLoadingRecommendations(true);
      const data = await api.get(`/recommendations/${loc}`);
      setRecommendations(data.recommendations || []);
    } catch (e) {
      console.error('Recommendations loading failed', e);
      setRecommendations([
        { id: 1, action: 'Deploy Emergency Aerators', cost: '₹1.2L/day', impact: 'High', time: 'Immediate' },
        { id: 2, action: 'Increase STP Capacity by 15%', cost: '₹4.5Cr', impact: 'Long-term', time: '6 Months' }
      ]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSpecies();
    fetchReports();
  }, []);

  useEffect(() => {
    fetchRiverHealth(selectedLocation);
    fetchForecast(selectedLocation);
    fetchSensorReadings(selectedLocation);
    fetchRecommendations(selectedLocation);
  }, [selectedLocation]);

  const handleActionClick = (actionName) => {
    toast.success(`Executing priority protocol: "${actionName}"...\nCommand dispatched to NMCG field units.`);
  };

  const getBODColor = (status) => {
    if (status === 'CRITICAL') return 'text-alert-red';
    if (status === 'WARNING') return 'text-orange-600';
    return 'text-safe-green';
  };

  const getBODBg = (status) => {
    if (status === 'CRITICAL') return 'bg-red-50/20';
    if (status === 'WARNING') return 'bg-orange-50/20';
    return 'bg-green-50/20';
  };

  const getReportStatusStyle = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700 border-gray-200';
    const normalized = status.toLowerCase();
    if (normalized.includes('resolved') || normalized.includes('approved') || normalized.includes('closed')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (normalized.includes('review') || normalized.includes('pending')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const recentReports = [...reports].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
  const recentSensorReadings = [...sensorReadings].slice(0, 4);

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* River Health Index Dial */}
        <div className="lg:col-span-3 bg-white p-6 border border-gray-200 shadow-sm flex flex-col items-center justify-between rounded-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center w-full border-b pb-2">
            River Health Index
          </h2>
          {loadingHealth ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : (
            <>
              <div className="relative w-44 h-44 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={riverHealth?.healthScore < 50 ? '#dc2626' : (riverHealth?.healthScore < 75 ? '#f5a623' : '#10b981')}
                    strokeWidth="8"
                    strokeDasharray={`${(riverHealth?.healthScore || 34) * 2.827} 282.7`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-gray-900 font-outfit">
                    {riverHealth?.healthScore}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">/100</span>
                </div>
              </div>
              <div className="text-center w-full space-y-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {riverHealth?.location} Monitoring
                </p>
                <div className="inline-block bg-red-50 text-alert-red border border-red-200 px-3 py-1 rounded-[3px] text-[10px] font-black tracking-widest uppercase">
                  {riverHealth?.status}
                </div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider pt-3 border-t border-gray-100 w-full block">
                  Last updated: {riverHealth?.latestReading?.timestamp ? new Date(riverHealth.latestReading.timestamp).toLocaleString() : 'N/A'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Live SVG Map */}
        <div className="lg:col-span-6 bg-white border border-gray-200 shadow-sm flex flex-col rounded-sm">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
              Live Monitoring Stations — Ganga Basin
            </h2>
            <div className="flex gap-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-[10px] font-bold border border-gray-300 rounded px-2 py-0.5 bg-white uppercase cursor-pointer"
              >
                <option value="Kanpur-Jajmau">Kanpur</option>
                <option value="Prayagraj-Sangam">Prayagraj</option>
                <option value="Varanasi-Ghats">Varanasi</option>
              </select>
            </div>
          </div>
          <div className="flex-1 bg-gray-950 relative min-h-[360px] overflow-hidden">
            {/* Grid Map Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(#33333340_1px,transparent_1px),linear-gradient(90deg,#33333340_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            {/* Simulated River Path SVG */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 0,25 Q 30,35 50,55 T 100,75" fill="none" stroke="#1e3a8a" strokeWidth="3" opacity="0.6" />
            </svg>

            {/* Kanpur Pin */}
            <div
              className={`absolute top-[32%] left-[30%] group cursor-pointer`}
              onClick={() => setSelectedLocation('Kanpur-Jajmau')}
            >
              <div className="relative flex h-4 w-4">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-red opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 bg-alert-red border-2 border-white shadow-lg ${selectedLocation === 'Kanpur-Jajmau' ? 'ring-2 ring-primary ring-offset-1' : ''}`}></span>
              </div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-[10px] font-bold text-gray-900 shadow-lg border-l-4 border-alert-red whitespace-nowrap">
                Kanpur
              </div>
            </div>

            {/* Prayagraj Pin */}
            <div
              className={`absolute top-[48%] left-[55%] group cursor-pointer`}
              onClick={() => setSelectedLocation('Prayagraj-Sangam')}
            >
              <div className="relative flex h-3.5 w-3.5">
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 bg-accent border-2 border-white shadow-lg ${selectedLocation === 'Prayagraj-Sangam' ? 'ring-2 ring-primary ring-offset-1' : ''}`}></span>
              </div>
              <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-[10px] font-bold text-gray-900 shadow-lg border-l-4 border-accent whitespace-nowrap">
                Prayagraj
              </div>
            </div>

            {/* Varanasi Pin */}
            <div
              className={`absolute top-[68%] left-[75%] group cursor-pointer`}
              onClick={() => setSelectedLocation('Varanasi-Ghats')}
            >
              <div className="relative flex h-3.5 w-3.5">
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 border-2 border-white shadow-lg ${selectedLocation === 'Varanasi-Ghats' ? 'ring-2 ring-primary ring-offset-1' : ''}`}></span>
              </div>
              <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-[10px] font-bold text-gray-900 shadow-lg border-l-4 border-yellow-400 whitespace-nowrap">
                Varanasi
              </div>
            </div>
          </div>
        </div>

        {/* Forecasts Panel */}
        <div className="lg:col-span-3 bg-white border border-gray-200 shadow-sm flex flex-col rounded-sm">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
              5-Day BOD Forecast ({selectedLocation.split('-')[0]})
            </h2>
          </div>
          <div className="flex-1 overflow-x-auto">
            {loadingForecast ? (
              <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : (
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="text-[10px] uppercase bg-gray-100 border-b text-gray-600 font-bold">
                  <tr>
                    <th className="px-3 py-2.5 border-r">Day</th>
                    <th className="px-3 py-2.5 border-r">BOD</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {forecast.map((dayObj, index) => (
                    <tr key={index} className={getBODBg(dayObj.status)}>
                      <td className="px-3 py-2.5 border-r font-bold text-gray-950">{dayObj.day}</td>
                      <td className={`px-3 py-2.5 border-r font-extrabold ${getBODColor(dayObj.status)}`}>
                        {dayObj.bodValue} mg/L
                      </td>
                      <td className={`px-3 py-2.5 text-[9px] font-black uppercase ${getBODColor(dayObj.status)}`}>
                        {dayObj.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Biodiversity Risk Assessment */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-4 flex items-center font-outfit uppercase tracking-wide">
          <Fish className="mr-2 h-4 w-4" /> Biodiversity Risk Assessment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingSpecies ? (
            <div className="col-span-3 flex justify-center py-6">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : (
            species.slice(0, 3).map((spec) => (
              <div key={spec._id} className="bg-white border border-gray-200 p-5 shadow-sm flex items-start space-x-4 rounded-sm">
                <div className="bg-red-100 p-3 rounded text-alert-red shrink-0">
                  <Fish className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm font-outfit uppercase">{spec.speciesName}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Status: {spec.conservationStatus}</p>
                  <div className={`inline-block text-white text-[9px] font-black px-2 py-0.5 mt-3 uppercase rounded-sm tracking-wider ${getRiskStyle(spec.riskLevel)}`}>
                    Habitat Risk: {spec.riskLevel}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Recent Citizen Reports</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loadingReports ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary h-6 w-6" />
              </div>
            ) : recentReports.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">No recent incidents have been submitted for this basin.</div>
            ) : (
              recentReports.map((report) => (
                <div key={report._id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <p className="text-sm font-bold text-gray-900">{report.location || 'Unknown location'}</p>
                    </div>
                    <p className="text-[11px] text-gray-500">{report.type || 'Incident'} • {report.description || 'No details provided'}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${getReportStatusStyle(report.status)}`}>
                    {report.status || 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Latest Sensor Trends</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loadingSensors ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary h-6 w-6" />
              </div>
            ) : recentSensorReadings.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">No sensor readings are available for the selected location yet.</div>
            ) : (
              recentSensorReadings.map((reading, index) => (
                <div key={reading._id || index} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{reading.timestamp ? new Date(reading.timestamp).toLocaleString() : 'Recent reading'}</p>
                    <p className="text-[11px] text-gray-500">BOD {reading.BOD ?? '--'} mg/L • DO {reading.DO ?? '--'} mg/L</p>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded ${reading.BOD > 25 ? 'bg-red-50 text-alert-red' : reading.BOD > 15 ? 'bg-amber-50 text-orange-600' : 'bg-green-50 text-safe-green'}`}>
                    {reading.BOD > 25 ? 'Critical' : reading.BOD > 15 ? 'Watch' : 'Stable'}
                  </div>
                </div>
              ))
            )}
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
          {loadingRecommendations ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : (
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
                {recommendations.map((rec, idx) => (
                  <tr key={rec.id} className={idx === 0 ? "border-b bg-red-50/20" : idx === 1 ? "border-b bg-gray-50/40" : "bg-white"}>
                    <td className={`px-4 py-3 border-r font-extrabold ${idx === 0 ? 'text-alert-red' : idx === 1 ? 'text-orange-500' : 'text-yellow-500'}`}>{idx + 1}</td>
                    <td className="px-4 py-3 border-r font-bold text-gray-900">
                      {rec.action}
                    </td>
                    <td className="px-4 py-3 border-r text-gray-500">{rec.cost}</td>
                    <td className="px-4 py-3 border-r font-extrabold text-green-700">{rec.impact}</td>
                    <td className="px-4 py-3 border-r text-gray-600">{rec.time}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleActionClick(rec.action)}
                        className={`${idx === 0 ? 'bg-alert-red hover:bg-alert-red/90' : 'bg-primary hover:bg-primary/95'} text-white font-bold px-3 py-1 rounded-[3px] text-[10px] tracking-wide uppercase transition-colors cursor-pointer`}
                      >
                        Deploy
                      </button>
                    </td>
                  </tr>
                ))}
                {recommendations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500">No recommendations currently available for this location.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );

  const getStationData = (stationPrefix) => {
    if (!stats || !stats.locationData) return null;
    return stats.locationData.find(loc => loc._id.toLowerCase().includes(stationPrefix.toLowerCase()));
  };

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

        {/* pins with loaded DB values */}
        <div className="absolute top-[32%] left-[30%] text-center">
          <span className="relative flex h-5 w-5 mx-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-alert-red border-2 border-white shadow-xl"></span>
          </span>
          <div className="bg-white p-2.5 rounded shadow-lg border border-gray-200 mt-2 text-left w-48 text-[10px] leading-relaxed">
            <p className="font-bold text-gray-900 border-b pb-1 text-xs">KANPUR CENTRAL</p>
            <p className="mt-1 text-red-600 font-extrabold">BOD: {getStationData('kanpur')?.latestBOD || '--'} mg/L</p>
            <p className="text-gray-500">DO: {getStationData('kanpur')?.latestDO || '--'} mg/L</p>
            <p className="text-gray-500">Turbidity: {getStationData('kanpur')?.latestTurbidity || '--'} NTU</p>
          </div>
        </div>

        <div className="absolute top-[48%] left-[55%] text-center">
          <span className="relative flex h-4.5 w-4.5 mx-auto">
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-accent border-2 border-white shadow-xl"></span>
          </span>
          <div className="bg-white p-2.5 rounded shadow-lg border border-gray-200 mt-2 text-left w-48 text-[10px] leading-relaxed">
            <p className="font-bold text-gray-900 border-b pb-1 text-xs">PRAYAGRAJ SANGAM</p>
            <p className="mt-1 text-orange-600 font-extrabold">BOD: {getStationData('prayagraj')?.latestBOD || '--'} mg/L</p>
            <p className="text-gray-500">DO: {getStationData('prayagraj')?.latestDO || '--'} mg/L</p>
            <p className="text-gray-500">Turbidity: {getStationData('prayagraj')?.latestTurbidity || '--'} NTU</p>
          </div>
        </div>

        <div className="absolute top-[68%] left-[75%] text-center">
          <span className="relative flex h-4.5 w-4.5 mx-auto">
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-yellow-400 border-2 border-white shadow-xl"></span>
          </span>
          <div className="bg-white p-2.5 rounded shadow-lg border border-gray-200 mt-2 text-left w-48 text-[10px] leading-relaxed">
            <p className="font-bold text-gray-900 border-b pb-1 text-xs">VARANASI GHATS</p>
            <p className="mt-1 text-yellow-600 font-extrabold">BOD: {getStationData('varanasi')?.latestBOD || '--'} mg/L</p>
            <p className="text-gray-500">DO: {getStationData('varanasi')?.latestDO || '--'} mg/L</p>
            <p className="text-gray-500">Turbidity: {getStationData('varanasi')?.latestTurbidity || '--'} NTU</p>
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
