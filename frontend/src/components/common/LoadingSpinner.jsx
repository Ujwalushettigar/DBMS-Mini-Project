import React from 'react';

export const LoadingSpinner = ({ message = 'Loading records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="w-8 h-8 border-3 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

