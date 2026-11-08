import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Building2 className="w-8 h-8 text-blue-900" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        The requested portal page does not exist or has been relocated by the recruitment board.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFound;

