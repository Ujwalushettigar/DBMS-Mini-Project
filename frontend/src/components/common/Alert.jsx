import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

const cfg = {
  info: { cls: 'border-gov-400 bg-gov-50 text-gov-800', Icon: Info },
  success: { cls: 'border-india-green bg-green-50 text-green-900', Icon: CheckCircle2 },
  warning: { cls: 'border-saffron-500 bg-orange-50 text-orange-900', Icon: AlertTriangle },
  error: { cls: 'border-red-500 bg-red-50 text-red-900', Icon: XCircle },
  danger: { cls: 'border-red-500 bg-red-50 text-red-900', Icon: XCircle },
};

export function Alert({ type = 'info', title, message, children, onClose }) {
  const normalizedType = type === 'danger' ? 'error' : type;
  const { cls, Icon } = cfg[normalizedType] ?? cfg.info;
  const body = children !== undefined ? children : message;

  return (
    <div role={normalizedType === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded border-l-4 p-3 text-sm ${cls}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{body}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="hover:opacity-75 transition text-inherit"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default Alert;
