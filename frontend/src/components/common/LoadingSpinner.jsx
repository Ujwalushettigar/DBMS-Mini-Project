import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label, message }) {
  const text = label || message || 'Loading...';

  return (
    <div className="flex items-center justify-center gap-2 py-10 text-gov-700" role="status">
      <Loader2 className="animate-spin" size={22} />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

export default LoadingSpinner;
