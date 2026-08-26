import React from 'react';
import { Truck, Zap } from 'lucide-react';

interface LogoProps {
  variant?: 'dark' | 'light' | 'white';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  showTagline = true,
  size = 'md',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const isLight = variant === 'light' || variant === 'white';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Badge */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 shadow-md text-white ${iconSizes[size]} shrink-0 p-1.5`}>
        <Truck className="w-full h-full stroke-[2.2]" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
          <Zap className="w-2 h-2 text-white fill-white" />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={`font-black tracking-tight ${textSizes[size]} ${isLight ? 'text-white' : 'text-slate-900'}`}>
            FISHORA
          </span>
          <span className="font-bold tracking-wide text-blue-600 uppercase text-xs px-1.5 py-0.5 rounded bg-blue-50">
            Express
          </span>
        </div>
        {showTagline && (
          <span className={`font-medium tracking-wide mt-0.5 ${taglineSizes[size]} ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>
            Fast Delivery. Trusted Service.
          </span>
        )}
      </div>
    </div>
  );
};
