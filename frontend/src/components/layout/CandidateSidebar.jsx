import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Layers,
  FileText,
  CreditCard,
  Award,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export const CandidateSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/candidate/profile', icon: User },
    { label: 'Educational Qualifications', path: '/candidate/qualifications', icon: GraduationCap },
    { label: 'Available Examinations', path: '/candidate/examinations', icon: Layers },
    { label: 'My Applications', path: '/candidate/applications', icon: FileText },
    { label: 'Admit Cards', path: '/candidate/admit-cards', icon: CreditCard },
    { label: 'Results', path: '/candidate/results', icon: Award }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 border-r border-slate-800 hidden md:block">
      {/* Candidate Profile Widget */}
      <div className="mb-6 p-3 bg-slate-800/70 rounded-md border border-slate-700/60">
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>Aspirant Portal</span>
        </div>
        <p className="text-white text-sm font-semibold truncate mt-1">
          {user?.full_name || 'Candidate'}
        </p>
        <p className="text-slate-400 text-xs truncate">
          {user?.candidate_number || user?.email}
        </p>
      </div>

      {/* Nav List */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-slate-800/80 transition mt-4"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </nav>

      <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-400">PostgreSQL Relational System</p>
        <p>Candidate ID: {user?.candidate_id ? user.candidate_id.slice(0, 8) + '...' : 'Active'}</p>
      </div>
    </aside>
  );
};

export default CandidateSidebar;

