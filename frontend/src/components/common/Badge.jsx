import React from 'react';
import { getStatusVariant } from '../../utils/helpers';

export const Badge = ({ children, variant, size = 'md' }) => {
  const calculatedVariant = variant || getStatusVariant(children);

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize ${variantStyles[calculatedVariant] || variantStyles.neutral} ${sizeStyles[size]}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {children ? children.toString().replace('_', ' ') : 'N/A'}
    </span>
  );
};

export default Badge;

