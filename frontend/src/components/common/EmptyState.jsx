import React from 'react';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({ title = 'No records found', description = 'There are no items matching your criteria.', icon: Icon = FileQuestion, action }) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;

