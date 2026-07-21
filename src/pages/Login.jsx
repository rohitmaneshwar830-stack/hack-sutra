import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function Login({ onNavigate }) {
  const { user, login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // If already logged in, redirect to correct portal on mount
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        onNavigate('/dashboard');
      } else {
        onNavigate('/citizen');
      }
    }
  }, [user, onNavigate]);

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [clearError]);

  const handlePrefill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') {
        onNavigate('/dashboard');
      } else {
        onNavigate('/citizen');
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl p-8 rounded-sm text-left">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <img src="/logo.png" alt="Ganga Guardian AI" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-black text-primary font-outfit uppercase">
            System Authorization
          </h2>
          <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">
            Ganga Guardian AI Portal
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure access for field officers and citizens
          </div>
        </div>

        {/* Auth Error Banner */}
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-alert-red shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-700 leading-normal">
              {localError || error}
            </p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@ganga.ai"
                autoComplete="email"
                className="w-full pl-10.5 pr-4 py-2.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-400 bg-gray-50/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Secure Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full pl-10.5 pr-4 py-2.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-400 bg-gray-50/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-sm shadow-md transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-primary/80 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>Verifying Security...</span>
              </>
            ) : (
              <span>Access Secure Portal</span>
            )}
          </button>
        </form>

        {/* Demo profiles picker */}
        <div className="mt-8 border-t border-gray-150 pt-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">
            Demo Portal Authorization Profiles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => handlePrefill('citizen@ganga.ai')}
              type="button"
              className="border border-gray-200 bg-gray-50 hover:bg-gray-100 p-2.5 text-center cursor-pointer rounded-sm hover:border-gray-300 transition-colors"
            >
              <p className="font-bold text-gray-800">Citizen Profile</p>
              <p className="text-[10px] text-gray-500 mt-0.5">citizen@ganga.ai (123456)</p>
            </button>
            <button
              onClick={() => handlePrefill('admin@ganga.ai')}
              type="button"
              className="border border-gray-200 bg-gray-50 hover:bg-gray-100 p-2.5 text-center cursor-pointer rounded-sm hover:border-gray-300 transition-colors"
            >
              <p className="font-bold text-gray-800">Government Admin</p>
              <p className="text-[10px] text-gray-500 mt-0.5">admin@ganga.ai (123456)</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
