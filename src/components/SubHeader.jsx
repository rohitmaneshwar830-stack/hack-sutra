import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function SubHeader() {
  const [activeSensors, setActiveSensors] = useState(null);
  const [lastSync, setLastSync] = useState('Loading...');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard/stats');
        setActiveSensors(data.monitoringLocations);
        setLastSync(data.latestTimestamp ? new Date(data.latestTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now');
      } catch (err) {
        console.error('Failed to load stats for subheader');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-primary border-b border-white/5 py-2.5 mt-19.5">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-white/80 uppercase tracking-wider gap-2">
          {/* Active indicator */}
          <div className="flex items-center space-x-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-safe-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-safe-green"></span>
            </div>
            <span className="text-white">Live Monitoring Active</span>
          </div>

          {/* Sync status metrics */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <span>Last Sync: {lastSync}</span>
            <span>Active Sensors: {activeSensors ? `${activeSensors}` : 'Loading...'}</span>
            <span>
              AI Model: <span className="text-safe-green font-extrabold animate-pulse">Running</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
