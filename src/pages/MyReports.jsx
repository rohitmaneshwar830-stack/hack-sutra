import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { FileText, Eye, Clock, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { getStatusStyle } from '../utils/styles';

export default function MyReports({ onNavigate }) {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const data = await api.get('/reports');
      setMyReports(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyReports();
    }
  }, [user]);



  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-left min-h-[calc(100vh-200px)]">
      <div className="border-b pb-4 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-primary font-outfit uppercase">
            My Submitted Reports
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
            Track validation progress and official resolutions
          </p>
        </div>
        <button
          onClick={() => onNavigate('/citizen')}
          className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-2 rounded-sm shadow transition-colors uppercase tracking-wider cursor-pointer"
        >
          File New Report
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary h-12 w-12" />
        </div>
      ) : myReports.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-gray-250 p-12 text-center rounded-sm">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 font-outfit">No active reports found</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
            You haven't submitted any pollution incidents yet. Your submissions help NMCG identify chemical and municipal contamination.
          </p>
          <button
            onClick={() => onNavigate('/citizen')}
            className="mt-6 border border-primary text-primary hover:bg-primary/5 text-xs font-bold px-5 py-2.5 rounded-sm transition-colors uppercase tracking-wider cursor-pointer"
          >
            File Incident Report Now
          </button>
        </div>
      ) : (
        /* List */
        <div className="space-y-6">
          {myReports.map((report) => (
            <div
              key={report._id}
              className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-primary/5 border border-primary/10 text-primary font-bold text-[10px] px-2.5 py-0.5 uppercase tracking-wider rounded-sm">
                    {report.type}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base font-outfit">{report.location}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Filed: Live Status Checked
                  </span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-4.5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    Verification State
                  </p>
                  <span
                    className={`px-3 py-1 rounded-[3px] text-xs font-bold border uppercase ${getStatusStyle(report.status)}`}
                  >
                    {report.status}
                  </span>
                </div>
                <button
                  onClick={() => toast.success(`Details — Location: ${report.location}. Type: ${report.type}. Status: ${report.status}. Description: ${report.description}`)}
                  className="p-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
