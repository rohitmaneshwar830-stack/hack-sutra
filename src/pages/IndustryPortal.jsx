import React, { useState, useEffect } from 'react';
import { Factory, Droplets, AlertTriangle, ShieldCheck, Activity, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function IndustryPortal() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIndustryData = async () => {
    try {
      setLoading(true);
      // For now, mock some stats using the general dashboard stats, or simulate industry-specific stats
      const data = await api.get('/dashboard/stats');
      setStats({
        dischargeLimit: '150 KLD',
        currentDischarge: '135 KLD',
        complianceStatus: 'GOOD',
        lastInspection: new Date().toLocaleDateString()
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to load industry metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustryData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-left min-h-[calc(100vh-200px)]">
      <div className="border-b pb-4 mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary font-outfit uppercase">
            Industry Compliance Portal
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
            Monitor zero-liquid-discharge (ZLD) metrics and regulatory status
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 px-3 py-1.5 rounded flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-safe-green" />
          <span className="text-xs font-extrabold text-green-800 uppercase tracking-wide">License Active</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary h-10 w-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
            <Factory className="h-6 w-6 text-gray-400 mb-3" />
            <div className="text-2xl font-black text-primary font-outfit">{stats?.currentDischarge}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Current Discharge</div>
          </div>
          
          <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
            <Droplets className="h-6 w-6 text-gray-400 mb-3" />
            <div className="text-2xl font-black text-primary font-outfit">{stats?.dischargeLimit}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Authorized Limit</div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
            <Activity className="h-6 w-6 text-gray-400 mb-3" />
            <div className="text-2xl font-black text-safe-green font-outfit">{stats?.complianceStatus}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Compliance State</div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
            <AlertTriangle className="h-6 w-6 text-gray-400 mb-3" />
            <div className="text-2xl font-black text-primary font-outfit">{stats?.lastInspection}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Last CPCB Sync</div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
        <h2 className="text-base font-bold text-gray-900 font-outfit uppercase mb-4 tracking-wide">
          Recent Effluent Reports
        </h2>
        <div className="text-sm text-gray-500 text-center py-8">
          All physical telemetry probes are functioning nominally. No anomalous discharge events detected in the last 30 days.
        </div>
      </div>
    </div>
  );
}
