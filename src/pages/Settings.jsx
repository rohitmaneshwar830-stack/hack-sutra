import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [pollingInterval, setPollingInterval] = useState('5 minutes');
  const [confidenceThreshold, setConfidenceThreshold] = useState('75%');
  const [notificationEmail, setNotificationEmail] = useState('alerts@gangaguardian.gov.in');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-left min-h-[calc(100vh-200px)]">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-2xl font-black text-primary font-outfit uppercase">
          System & Telemetry Settings
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          Configure telemetry polling intervals and AI warning parameters
        </p>
      </div>

      <div className="bg-white border border-gray-200 shadow-xl p-8 rounded-sm">
        
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 p-4 mb-6 rounded flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-safe-green shrink-0" />
            <p className="text-xs font-bold text-safe-green uppercase tracking-wide">
              Configuration parameters saved successfully!
            </p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Telemetry Polling */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Active Sensor Polling Interval
            </label>
            <p className="text-[10px] text-gray-400 mb-2 leading-normal">
              Frequencies at which node telemetry is synced from regional outfalls.
            </p>
            <select
              value={pollingInterval}
              onChange={(e) => setPollingInterval(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white cursor-pointer"
            >
              <option>2 minutes</option>
              <option>5 minutes</option>
              <option>15 minutes</option>
              <option>1 hour</option>
              <option>6 hours (Eco Mode)</option>
            </select>
          </div>

          {/* AI Alert Threshold */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              AI Alert Confidence Threshold
            </label>
            <p className="text-[10px] text-gray-400 mb-2 leading-normal">
              Minimum confidence parameter required to generate alerts. Lower rates trigger earlier alerts but increase false flag reports.
            </p>
            <select
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white cursor-pointer"
            >
              <option>60% (High sensitivity)</option>
              <option>70% (Standard)</option>
              <option>75%</option>
              <option>80%</option>
              <option>90% (High validation check)</option>
            </select>
          </div>

          {/* Contact Notifications email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Central Alert Notification Address
            </label>
            <p className="text-[10px] text-gray-400 mb-2 leading-normal">
              Designated inbox where critical root-cause reports are automatically dispatched.
            </p>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50/30 font-medium"
            />
          </div>

          {/* Warnings */}
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-sm flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-[11px] text-orange-900 leading-normal font-medium">
              CRITICAL: Changes to telemetry polling parameters affect physical node battery modules and server bandwidth consumption in region Kanpur-Varanasi.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-sm shadow-md transition-colors uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="h-4 w-4 text-accent" />
              <span>Save System Parameters</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
