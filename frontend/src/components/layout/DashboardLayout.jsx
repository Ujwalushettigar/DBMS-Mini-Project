import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CandidateSidebar } from './CandidateSidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export const DashboardLayout = ({ role = 'candidate' }) => {
  const { isAdmin } = useAuth();
  const effectiveRole = role === 'admin' || isAdmin ? 'admin' : 'candidate';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        {effectiveRole === 'admin' ? <AdminSidebar /> : <CandidateSidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;

