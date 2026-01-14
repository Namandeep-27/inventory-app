'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-4 sm:mb-6 md:mb-8', className)}>
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0 w-full sm:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
