import React from 'react';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound({ onNavigate }) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl p-8 rounded-sm text-left">
        <div className="flex items-center gap-3 mb-4 border-b pb-4">
          <AlertCircle className="h-8 w-8 text-alert-red shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">404 Page Not Found</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Route Resolution Failure</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          The requested page could not be located. Verify that the URL is correct or that the path is active.
        </p>

        <button
          onClick={() => onNavigate('/')}
          className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-4 rounded-sm shadow-md transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="h-4 w-4 text-accent" />
          <span>Return to Safety</span>
        </button>
      </div>
    </div>
  );
}
