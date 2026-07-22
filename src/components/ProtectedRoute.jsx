import React, { useEffect } from 'react';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children, allowedRoles, onRedirect }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        onRedirect('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If logged in but not authorized for this specific role, redirect appropriately
        if (user.role === 'admin') {
          onRedirect('/dashboard');
        } else if (user.role === 'citizen') {
          onRedirect('/citizen');
        } else {
          onRedirect('/');
        }
      }
    }
  }, [user, loading, allowedRoles, onRedirect]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <div className="h-12 w-12 border-4 border-safe-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">
          Securing Access Environment...
        </p>
      </div>
    );
  }

  // If user is loaded but not allowed, return null to avoid flashing layout components before redirect triggers
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return children;
}
