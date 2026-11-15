import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';

export function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="404 - Page Not Found"
        crumbs={[{ label: 'Not Found' }]}
      />

      <div className="gov-card max-w-lg mx-auto p-8 text-center space-y-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron-500/10 text-saffron-600 mx-auto">
          <AlertTriangle size={36} />
        </span>
        <h2 className="text-3xl font-bold text-gov-800">404</h2>
        <p className="text-sm font-semibold text-slate-700">Requested Portal Resource Not Found</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested URL does not match any active route or document on this recruitment management portal.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="gov-btn gov-btn-primary"
          >
            <Home size={16} /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
