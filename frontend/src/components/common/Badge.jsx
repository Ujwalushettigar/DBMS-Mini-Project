import React from 'react';
import { getStatusVariant } from '../../utils/helpers';

const styles = {
  success: 'bg-green-100 text-green-800 border-green-300',
  warning: 'bg-amber-100 text-amber-800 border-amber-300',
  danger: 'bg-red-100 text-red-800 border-red-300',
  info: 'bg-gov-50 text-gov-700 border-gov-200',
  blue: 'bg-gov-50 text-gov-700 border-gov-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-300',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[11px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm'
};

export function Badge({ variant, size = 'md', children }) {
  const calculatedVariant = variant || (typeof children === 'string' ? getStatusVariant(children) : 'neutral');
  const styleCls = styles[calculatedVariant] ?? styles.neutral;
  const szCls = sizeStyles[size] ?? sizeStyles.md;
  const content = typeof children === 'string' ? children.replace(/_/g, ' ') : children;

  return (
    <span className={`inline-flex items-center rounded border font-semibold capitalize ${styleCls} ${szCls}`}>
      {content ?? 'N/A'}
    </span>
  );
}

export default Badge;
