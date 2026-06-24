import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, MapPin, Camera, Trash2, CheckCircle, FileText, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CitizenPortal() {
  const { user } = useAuth();
  
  // Form states
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Reports loading & state
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Load existing reports
    const defaultReports = [
      { id: 1, location: 'Kanpur Ghat', type: 'Industrial', reporter: 'Citizen #4821', time: '2 hrs ago', status: 'Under Review', statusStyle: 'bg-gray-100 text-gray-800 border-gray-300' },
      { id: 2, location: 'Varanasi Ghats', type: 'Solid Waste', reporter: 'NGO Worker', time: '5 hrs ago', status: 'Verified', statusStyle: 'bg-blue-100 text-blue-800 border-blue-200' },
      { id: 3, location: 'Prayagraj Sangam', type: 'Sewage', reporter: 'NMCG Official', time: '1 day ago', status: 'Action Taken', statusStyle: 'bg-green-100 text-green-800 border-green-200' },
      { id: 4, location: 'Haridwar Har Ki Pauri', type: 'Oil Spill', reporter: 'Citizen #3301', time: '2 days ago', status: 'Resolved', statusStyle: 'bg-gray-100 text-gray-800 border-gray-300' }
    ];

    const savedReports = localStorage.getItem('ganga_guardian_citizen_reports');
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
      } catch (e) {
        setReports(defaultReports);
      }
    } else {
      setReports(defaultReports);
      localStorage.setItem('ganga_guardian_citizen_reports', JSON.stringify(defaultReports));
    }
  }, []);

  const handleGPSPrefill = () => {
    setLocation('Parmat Ghat, Kanpur (GPS Coordinates: 26.4784° N, 80.3421° E)');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location || !type || !description) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    const newReport = {
      id: Date.now(),
      location: location,
      type: type,
      reporter: user?.name || 'Anonymous Citizen',
      time: 'Just now',
      status: 'Under Review',
      statusStyle: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem('ganga_guardian_citizen_reports', JSON.stringify(updatedReports));

    // Celebrate report submission!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0f1b31', '#f5a623', '#2d6a4f', '#ffffff']
    });

    // Reset Form
    setLocation('');
    setType('');
    setDescription('');
    setFileName('');
    setSubmitSuccess(true);

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
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
            <div className="text-center mb-4">
              <div className="text-5xl font-extrabold text-alert-red font-outfit">
                34<span className="text-xl text-gray-400 font-semibold">/100</span>
              </div>
              <div className="text-alert-red font-bold text-base mt-1.5 tracking-wider font-outfit">
                POOR QUALITY
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div className="bg-alert-red h-3 rounded-full" style={{ width: '34%' }}></div>
            </div>
            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">
              Kanpur Ghat Monitoring Zone
            </p>
          </div>

          {/* Official Notices */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-primary" /> Official Notifications
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="p-4 border-l-4 border-l-accent bg-orange-50/20">
                <p className="text-xs font-bold text-gray-900 leading-tight">WARNING: High turbidity near Varanasi Ghat</p>
                <span className="text-[9px] font-bold text-gray-400 mt-1 block uppercase tracking-wider">3 hrs ago</span>
              </div>
              <div className="p-4 border-l-4 border-l-alert-red bg-red-50/20">
                <p className="text-xs font-bold text-gray-900 leading-tight">ALERT: BOD spike detected near Kanpur industrial zone</p>
                <span className="text-[9px] font-bold text-gray-400 mt-1 block uppercase tracking-wider">6 hrs ago</span>
              </div>
              <div className="p-4 border-l-4 border-l-safe-green bg-green-50/20">
                <p className="text-xs font-bold text-gray-900 leading-tight">INFO: Namami Gange cleanup drive scheduled at Prayagraj</p>
                <span className="text-[9px] font-bold text-gray-400 mt-1 block uppercase tracking-wider">Tomorrow</span>
              </div>
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
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                  >
                    <option value="" disabled>Select Type...</option>
                    <option>Sewage Discharge</option>
                    <option>Industrial Effluent</option>
                    <option>Solid Waste / Plastic</option>
                    <option>Oil Spill</option>
                    <option>Dead Aquatic Life</option>
                    <option>Other</option>
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
                      accept="image/*,video/*"
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
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 px-4 rounded-sm shadow-md transition-colors uppercase tracking-wider text-xs cursor-pointer"
                  >
                    Submit Official Incident Report
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
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 border-r text-gray-900">{report.location}</td>
                      <td className="px-4 py-3 border-r text-gray-700">{report.type}</td>
                      <td className="px-4 py-3 border-r text-gray-500">{report.reporter}</td>
                      <td className="px-4 py-3 border-r text-gray-500">{report.time}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold border ${report.statusStyle || 'bg-gray-100 border-gray-200'}`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
