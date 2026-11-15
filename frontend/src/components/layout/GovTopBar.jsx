import React, { useEffect, useState } from 'react';
import { Contrast } from 'lucide-react';

const SIZES = [87.5, 100, 112.5, 125]; // % of browser default font size

export function GovTopBar() {
  const [idx, setIdx] = useState(1);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${SIZES[idx]}%`;
  }, [idx]);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  const btn = 'rounded border border-white/40 px-2 py-0.5 text-xs hover:bg-white/15 disabled:opacity-40 transition';

  return (
    <div className="no-print">
      <div className="flex h-1" aria-hidden="true">
        <span className="flex-1 bg-saffron-500" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-india-green" />
      </div>
      <div className="bg-gov-900 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5">
          <a href="#main-content" className="hover:underline focus:outline-none focus:ring-2 focus:ring-saffron-500">
            Skip to main content
          </a>
          <div className="flex items-center gap-1.5" role="group" aria-label="Accessibility options">
            <button className={btn} onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} aria-label="Decrease text size">A-</button>
            <button className={btn} onClick={() => setIdx(1)} aria-label="Reset text size">A</button>
            <button className={btn} onClick={() => setIdx((i) => Math.min(SIZES.length - 1, i + 1))} disabled={idx === SIZES.length - 1} aria-label="Increase text size">A+</button>
            <button className={`${btn} inline-flex items-center gap-1`} onClick={() => setHighContrast((v) => !v)} aria-pressed={highContrast} aria-label="Toggle high contrast">
              <Contrast size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GovTopBar;
