import React from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UploadCloud, LogOut, ShieldAlert } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="h-6 w-6 text-indigo-400" />
            <span className="text-lg font-bold tracking-tight">ReconcileEngine</span>
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/upload"
              className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Ingestion</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md border border-slate-700 transition"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};