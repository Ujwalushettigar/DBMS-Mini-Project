import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Phone, Mail } from 'lucide-react';

export function GovHeader() {
  return (
    <header className="no-print border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-saffron-500 rounded" aria-label="GREMS home">
          {/* Placeholder landmark icon. Do NOT use the national emblem or official agency logo */}
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gov-700 bg-gov-50 text-gov-700 shrink-0">
            <Landmark size={28} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-gov-700">सरकारी भर्ती परीक्षा प्रबंधन प्रणाली</span>
            <span className="block text-lg font-bold uppercase tracking-wide text-gov-900 sm:text-xl">
              Government Recruitment Examination Management System
            </span>
            <span className="block text-xs text-slate-500">Online Application Portal · Academic DBMS Mini Project</span>
          </span>
        </Link>
        <div className="hidden text-right text-xs text-slate-600 md:block">
          <p className="flex items-center justify-end gap-1"><Phone size={12} /> Help Desk: 1800-000-0000 (demo)</p>
          <p className="flex items-center justify-end gap-1"><Mail size={12} /> helpdesk@grems.example</p>
          <p className="mt-0.5">Mon-Fri, 10:00 AM - 5:00 PM</p>
        </div>
      </div>
    </header>
  );
}

export default GovHeader;
