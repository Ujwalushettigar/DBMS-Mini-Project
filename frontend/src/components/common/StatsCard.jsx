import React from 'react';

const tones = {
  blue: { border: 'border-gov-600', chip: 'bg-gov-50 text-gov-700' },
  saffron: { border: 'border-saffron-500', chip: 'bg-orange-50 text-saffron-600' },
  green: { border: 'border-india-green', chip: 'bg-green-50 text-india-green' },
  red: { border: 'border-red-500', chip: 'bg-red-50 text-red-600' },
  amber: { border: 'border-saffron-500', chip: 'bg-orange-50 text-saffron-600' },
  purple: { border: 'border-gov-700', chip: 'bg-gov-50 text-gov-800' },
  slate: { border: 'border-slate-400', chip: 'bg-slate-100 text-slate-700' },
};

export function StatsCard({ title, value, icon: Icon, tone, color, hint, description }) {
  const chosenTone = tone || color || 'blue';
  const t = tones[chosenTone] ?? tones.blue;
  const note = hint || description;

  return (
    <div className={`gov-card flex items-center gap-4 border-l-4 p-4 ${t.border}`}>
      {Icon && (
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${t.chip}`}>
          <Icon size={22} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-gov-900">{value !== undefined ? value : '—'}</p>
        {note && <p className="text-xs text-slate-500 mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

export default StatsCard;
