import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PanelLeft } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CandidateSidebar } from './CandidateSidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export function DashboardLayout({ role, children }) {
  const { user, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const effectiveRole = role ?? (user?.role === 'admin' || isAdmin ? 'admin' : 'candidate');
  const Sidebar = effectiveRole === 'admin' ? AdminSidebar : CandidateSidebar;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <button
          type="button"
          className="gov-btn gov-btn-outline no-print self-start lg:hidden"
          onClick={() => setShowMenu((v) => !v)}
          aria-expanded={showMenu}
        >
          <PanelLeft size={16} /> Dashboard Menu
        </button>
        <aside className={`no-print w-full shrink-0 lg:block lg:w-64 ${showMenu ? 'block' : 'hidden'}`}>
          <Sidebar />
        </aside>
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          {children ?? <Outlet />}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardLayout;
