import React, { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { getStatusStyle } from '../utils/styles';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.get('/reports');
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/reports/${id}`, { status: newStatus });
      toast.success(`Report #${id} status updated to: "${newStatus}"`);
      // Reload reports
      loadReports();
    } catch (err) {
      toast.error(`Failed to update report status: ${err.message}`);
    }
  };



  return (
    <div className="max-w-275 mx-auto px-4 py-10 min-h-screen text-left">
      {/* Title */}
      <div className="border-b-2 border-primary pb-4 mb-8">
        <h1 className="text-xl md:text-2xl font-black text-primary uppercase tracking-wide font-outfit">
          Citizen Environmental Incident Reports
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          Verify field reports and manage regulatory actions
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary h-12 w-12" />
        </div>
      ) : reports.length === 0 ? (
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
                  <tr key={report._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-4 border-r text-gray-900 font-bold">{report.location}</td>
                    <td className="px-4 py-4 border-r text-gray-700">{report.type}</td>
                    <td className="px-4 py-4 border-r text-gray-500">{report.citizenName || 'Citizen'}</td>
                    <td className="px-4 py-4 border-r text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 border-r">
                      <span className={`px-2.5 py-0.5 rounded-[3px] text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-1.5 justify-center items-center">
                      <button
                        onClick={() => handleUpdateStatus(report._id, 'Verified')}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-[3px] uppercase tracking-wider cursor-pointer"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report._id, 'Action Taken')}
                        className="bg-safe-green hover:bg-safe-green/90 text-white text-[10px] font-bold px-2 py-1 rounded-[3px] uppercase tracking-wider cursor-pointer"
                      >
                        Action
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report._id, 'Resolved')}
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
