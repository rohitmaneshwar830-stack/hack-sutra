import React from 'react';

export default function SubHeader() {
  return (
    <div className="bg-[#0f1b31] border-b border-white/5 py-2.5 mt-[78px]">
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
            <span>Last Sync: 2 min ago</span>
            <span>Active Sensors: 47/52</span>
            <span>
              AI Model: <span className="text-safe-green font-extrabold animate-pulse">Running</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
