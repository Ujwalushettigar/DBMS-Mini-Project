import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No records found', message, description, icon: Icon = Inbox, action }) {
  const text = message || description;

  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-slate-500">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gov-50 text-gov-400 mb-1">
        <Icon size={28} />
      </span>
      <p className="font-semibold text-slate-700">{title}</p>
      {text && <p className="max-w-md text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export default EmptyState;
