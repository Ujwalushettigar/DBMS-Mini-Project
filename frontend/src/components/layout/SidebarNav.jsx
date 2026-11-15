import React from 'react';
import { NavLink } from 'react-router-dom';

export function SidebarNav({ title, subtitle, items }) {
  return (
    <nav className="gov-card overflow-hidden" aria-label={title}>
      <div className="bg-gov-700 px-4 py-3 text-white">
        {subtitle && <p className="text-xs uppercase tracking-wide text-white/70">{subtitle}</p>}
        <p className="font-semibold">{title}</p>
      </div>
      <ul className="divide-y divide-line">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 border-l-4 px-4 py-2.5 text-sm transition ${
                  isActive
                    ? 'border-saffron-500 bg-gov-50 font-semibold text-gov-800'
                    : 'border-transparent text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {Icon && <Icon size={16} className="shrink-0" />} <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SidebarNav;
