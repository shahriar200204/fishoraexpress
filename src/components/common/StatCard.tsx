import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'orange' | 'rose' | 'slate' | 'indigo';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  color = 'blue',
  onClick,
  className = '',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70',
      iconBg: 'bg-blue-100/80 text-blue-600',
      border: 'border-blue-100',
      valColor: 'text-slate-900',
    },
    emerald: {
      bg: 'bg-emerald-50/60',
      iconBg: 'bg-emerald-100/80 text-emerald-600',
      border: 'border-emerald-100',
      valColor: 'text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50/60',
      iconBg: 'bg-amber-100/80 text-amber-600',
      border: 'border-amber-100',
      valColor: 'text-amber-700',
    },
    purple: {
      bg: 'bg-purple-50/60',
      iconBg: 'bg-purple-100/80 text-purple-600',
      border: 'border-purple-100',
      valColor: 'text-purple-700',
    },
    orange: {
      bg: 'bg-orange-50/60',
      iconBg: 'bg-orange-100/80 text-orange-600',
      border: 'border-orange-100',
      valColor: 'text-orange-700',
    },
    rose: {
      bg: 'bg-rose-50/60',
      iconBg: 'bg-rose-100/80 text-rose-600',
      border: 'border-rose-100',
      valColor: 'text-rose-700',
    },
    indigo: {
      bg: 'bg-indigo-50/60',
      iconBg: 'bg-indigo-100/80 text-indigo-600',
      border: 'border-indigo-100',
      valColor: 'text-indigo-700',
    },
    slate: {
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-200/80 text-slate-700',
      border: 'border-slate-200',
      valColor: 'text-slate-900',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border ${scheme.border} bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`p-2 rounded-xl ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-2.5">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${scheme.valColor}`}>
          {value}
        </div>
        {subValue && (
          <p className="mt-1 text-xs text-slate-500 font-medium">{subValue}</p>
        )}
      </div>
    </div>
  );
};
