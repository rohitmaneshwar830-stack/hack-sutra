import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle2, ShieldAlert, Check } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);

  const loadReports = () => {
    const saved = localStorage.getItem('ganga_guardian_citizen_reports');
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = (id, newStatus, styleClass) => {
    const updated = reports.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          statusStyle: styleClass
        };
      }
      return r;
    });

    setReports(updated);
    localStorage.setItem('ganga_guardian_citizen_reports', JSON.stringify(updated));
    alert(`Report #${id} status updated to: "${newStatus}"`);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-10 min-h-screen text-left">
      {/* Title */}
      <div className="border-b-2 border-primary pb-4 mb-8">
        <h1 className="text-xl md:text-2xl font-black text-primary uppercase tracking-wide font-outfit">
          Citizen Environmental Incident Reports
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          Verify field reports and manage regulatory actions
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white border border-gray-250 p-16 text-center rounded-sm">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">No citizen reports found</h3>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase bg-gray-100 text-gray-600 border-b font-bold">
                <tr>
                  <th className="px-4 py-3.5 border-r">Location</th>
                  <th className="px-4 py-3.5 border-r">Pollution Type</th>
                  <th className="px-4 py-3.5 border-r">Reported By</th>
                  <th className="px-4 py-3.5 border-r">Time Elapsed</th>
                  <th className="px-4 py-3.5 border-r">Current Status</th>
                  <th className="px-4 py-3.5 text-center">Enforcement Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-250 font-medium">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-4 border-r text-gray-900 font-bold">{report.location}</td>
                    <td className="px-4 py-4 border-r text-gray-700">{report.type}</td>
                    <td className="px-4 py-4 border-r text-gray-500">{report.reporter}</td>
                    <td className="px-4 py-4 border-r text-gray-500">{report.time}</td>
                    <td className="px-4 py-4 border-r">
                      <span className={`px-2.5 py-0.5 rounded-[3px] text-[10px] font-black border uppercase tracking-wider ${report.statusStyle || 'bg-gray-100 border-gray-200'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-1.5 justify-center items-center">
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'Verified', 'bg-blue-100 text-blue-800 border-blue-200')}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-[3px] uppercase tracking-wider cursor-pointer"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'Action Taken', 'bg-green-100 text-green-800 border-green-200')}
                        className="bg-safe-green hover:bg-safe-green/90 text-white text-[10px] font-bold px-2 py-1 rounded-[3px] uppercase tracking-wider cursor-pointer"
                      >
                        Action
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'Resolved', 'bg-gray-100 text-gray-800 border-gray-300')}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-bold px-2 py-1 rounded-[3px] uppercase tracking-wider cursor-pointer"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
