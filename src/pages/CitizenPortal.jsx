import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { AlertCircle, MapPin, Camera, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { getStatusStyle, getAlertStyle } from '../utils/styles';

export default function CitizenPortal() {
  useAuth();
  
  // Form states
  const [location, setLocation] = useState('');
  const [gpsCoords, setGpsCoords] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Data states
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [riverHealth, setRiverHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const data = await api.get('/reports');
      setReports(data.data || []);
    } catch (e) {
      toast.error(`Failed to load reports: ${e.message}`);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchRiverHealth = async (stationName) => {
    try {
      setLoadingHealth(true);
      const data = await api.get(`/dashboard/river-health/${encodeURIComponent(stationName)}`);
      setRiverHealth(data);
    } catch (e) {
      // River health unavailable — show no-data state, don't crash
      setRiverHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  // Discover available stations from dashboard overview, then load health for first station found.
  const fetchRiverHealthFromOverview = async () => {
    try {
      setLoadingHealth(true);
      const overview = await api.get('/dashboard/overview');
      const firstStation = overview?.locationData?.[0]?._id;
      if (firstStation) {
        const data = await api.get(`/dashboard/river-health/${encodeURIComponent(firstStation)}`);
        setRiverHealth(data);
      } else {
        setRiverHealth({ availability: 'no_data' });
      }
    } catch (e) {
      setRiverHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const data = await api.get('/alerts');
      setAlerts(data.data || []);
    } catch (e) {
      toast.error(`Failed to load alerts: ${e.message}`);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchRiverHealthFromOverview();
    fetchAlerts();
  }, []);

  const handleGPSPrefill = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported by this browser.');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setGpsCoords(`${coords.latitude}, ${coords.longitude}`);
      setLocation(`${coords.latitude}, ${coords.longitude}`);
    }, () => toast.error('Unable to read your location. Enter it manually.'));
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location || !type || !description) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('location', location);
      formData.append('type', type);
      formData.append('description', description);
      formData.append('gpsCoords', gpsCoords);
      if (file) {
        formData.append('image', file);
      }

      await api.post('/reports', formData);

      // Celebrate report submission!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0f1b31', '#f5a623', '#2d6a4f', '#ffffff']
      });

      // Reset Form
      setLocation('');
      setGpsCoords('');
      setType('');
      setDescription('');
      setFileName('');
      setFile(null);
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 4000);

      // Reload reports
      fetchReports();
    } catch (err) {
      toast.error(`Failed to submit report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-primary py-12 px-4 text-white text-left relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide font-outfit">
            River Health — Citizen Portal
          </h1>
          <p className="text-white/80 mt-2 text-sm max-w-xl leading-relaxed">
            Empowering citizens to protect the Ganga basin through transparency, direct field reports, and telemetry updates.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - Status & Notices */}
        <div className="lg:col-span-4 space-y-8 text-left">
          
          {/* Local Health Card */}
          <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b pb-2">
              Local River Health
            </h2>
            {loadingHealth ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : riverHealth ? (
              <>
                <div className="text-center mb-4">
                  <div className="text-5xl font-extrabold text-alert-red font-outfit">
                    {riverHealth.healthScore}<span className="text-xl text-gray-400 font-semibold">/100</span>
                  </div>
                  <div className="text-alert-red font-bold text-base mt-1.5 tracking-wider font-outfit uppercase">
                    {riverHealth.status} QUALITY
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div className="bg-alert-red h-3 rounded-full" style={{ width: `${riverHealth.healthScore}%` }}></div>
                </div>
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">
                  {riverHealth.location || 'Kanpur Ghat Monitoring Zone'}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500 p-4 text-center">Health data unavailable</p>
            )}
          </div>

          {/* Official Notices */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-primary" /> Official Notifications
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {loadingAlerts ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-primary h-6 w-6" />
                </div>
              ) : alerts.length === 0 ? (
                <p className="text-xs text-gray-500 p-4 text-center">No active notifications.</p>
              ) : (
                alerts.slice(0, 4).map((alert) => (
                  <div key={alert._id} className={`p-4 border-l-4 ${getAlertStyle(alert.severity)}`}>
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                      {alert.severity.toUpperCase()}: {alert.title}
                    </p>
                    <span className="text-[9px] font-bold text-gray-400 mt-1 block uppercase tracking-wider">
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column - Submission Form & Table */}
        <div className="lg:col-span-8 space-y-8 text-left">
          
          {/* Report Form */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
            <div className="bg-primary px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-outfit">
                Report Pollution Incident
              </h2>
              {submitSuccess && (
                <div className="flex items-center gap-1 text-xs text-accent font-bold animate-pulse uppercase">
                  <Check className="h-4 w-4" /> Report Submitted!
                </div>
              )}
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Incident Location *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="E.g., Near Dashashwamedh Ghat, Varanasi"
                      className="flex-grow border border-gray-300 rounded-l-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50/30"
                    />
                    <button
                      type="button"
                      onClick={handleGPSPrefill}
                      className="bg-gray-100 border border-l-0 border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded-r-sm flex items-center transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1" /> Mock GPS
                    </button>
                  </div>
                </div>

                {/* Pollution Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Type of Pollution *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                  >
                    <option value="" disabled>Select Type...</option>
                    <option value="Sewage Discharge">Sewage Discharge</option>
                    <option value="Industrial Effluent">Industrial Effluent</option>
                    <option value="Solid Waste / Plastic">Solid Waste / Plastic</option>
                    <option value="Oil Spill">Oil Spill</option>
                    <option value="Dead Aquatic Life">Dead Aquatic Life</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Details & Observations *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe color, smell, active flow, or nearby factories..."
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50/30"
                  />
                </div>

                {/* Evidence Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Evidence Upload (Photo/Video)
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-sm p-5 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-gray-600">
                      {fileName ? `File chosen: ${fileName}` : 'Click here to upload photo or drag & drop'}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 px-4 rounded-sm shadow-md transition-colors uppercase tracking-wider text-xs cursor-pointer flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>Submitting Report...</span>
                      </>
                    ) : (
                      <span>Submit Official Incident Report</span>
                    )}
                  </button>
                  <p className="text-[9px] text-gray-400 mt-2 text-center leading-normal">
                    False reporting is punishable under the Environmental Protection Act. Incidents are logged and verified via nearby sensors.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-outfit">
                Recent Community Reports
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase bg-gray-100 text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 border-r">Location</th>
                    <th className="px-4 py-3 border-r">Type</th>
                    <th className="px-4 py-3 border-r">Reported By</th>
                    <th className="px-4 py-3 border-r">Time</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  {loadingReports ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6">
                        <Loader2 className="animate-spin text-primary h-6 w-6 mx-auto" />
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500 font-bold">
                        No community reports logged.
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report._id || report.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 border-r text-gray-900">{report.location}</td>
                        <td className="px-4 py-3 border-r text-gray-700">{report.type}</td>
                        <td className="px-4 py-3 border-r text-gray-500">{report.citizenName || report.reporter}</td>
                        <td className="px-4 py-3 border-r text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString() || report.time}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold border uppercase ${getStatusStyle(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
