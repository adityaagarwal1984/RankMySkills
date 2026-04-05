import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-stone-700 border-t-amber-400" />
          <p className="text-sm text-slate-300">Checking admin session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
