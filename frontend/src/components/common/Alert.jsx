import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({ type = 'info', title, message, onClose }) => {
  const configs = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: AlertCircle,
      iconColor: 'text-rose-600'
    }
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border flex items-start space-x-3 ${config.bg}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;

