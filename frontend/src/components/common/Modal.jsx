import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, isOpen, title, onClose, children, footer, maxWidth = 'max-w-lg' }) {
  const isModalOpen = open !== undefined ? open : isOpen;

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isModalOpen, onClose]);

  if (!isModalOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`gov-card max-h-[90vh] w-full ${maxWidth} overflow-y-auto`}>
        <div className="gov-card-header justify-between">
          <span className="font-semibold text-gov-800">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="hover:opacity-75 transition text-slate-500 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line bg-slate-50 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
