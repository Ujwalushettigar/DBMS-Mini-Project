import React from 'react';
import { Megaphone } from 'lucide-react';

export function NewsTicker({ items = [] }) {
  if (!items.length) return null;
  return (
    <section className="gov-card no-print flex items-stretch overflow-hidden" aria-label="What's new">
      <span className="flex shrink-0 items-center gap-2 bg-saffron-500 px-4 text-sm font-bold uppercase text-white">
        <Megaphone size={16} /> What&rsquo;s New
      </span>
      <div className="marquee flex-1 py-2">
        <ul className="marquee-track text-sm text-gov-800">
          {items.map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-saffron-500" aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default NewsTicker;
