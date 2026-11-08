import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  User,
  LogOut,
  Layers,
  Menu,
  X,
  ShieldCheck,
  Home,
  Info
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'About', path: '/about', icon: Info },
    { label: 'Examinations', path: '/examinations', icon: Layers }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white tracking-wide">भारत सरकार</span>
          <span className="text-slate-500">|</span>
          <span>GOVERNMENT OF INDIA</span>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          Government Recruitment Examination Management System (GREMS) • DBMS Mini Project
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Portal Branding */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded bg-blue-900 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-800 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold tracking-tight text-slate-900 uppercase">
                  GREMS Portal
                </div>
                <div className="text-[10px] uppercase font-semibold text-blue-900 tracking-wider">
                  Public Recruitment Examinations
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                    active
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth Button */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/candidate/dashboard'}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-700" />
                  )}
                  <span>
                    {isAdmin ? 'Admin Console' : (user?.full_name || 'Candidate Dashboard')}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                    isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {user?.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium text-blue-900 hover:bg-blue-50 transition border border-transparent"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 shadow-sm transition"
                >
                  Candidate Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/candidate/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-700"
                >
                  Go to Dashboard ({user?.role})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-blue-900 rounded-md text-sm font-medium text-blue-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-blue-900 rounded-md text-sm font-medium text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

