'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  iconColor?: string;
  isUrgent?: boolean;
}

export default function ActionCard({
  title,
  subtitle,
  description,
  icon: Icon,
  onClick,
  className,
  iconColor = 'text-blue-600',
  isUrgent = false,
}: ActionCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6 md:p-8 cursor-pointer transition-all',
        isUrgent
          ? 'border-amber-300 border-2 bg-amber-50/30 hover:border-amber-400 hover:shadow-xl'
          : 'border-slate-200 hover:shadow-xl hover:border-blue-300',
        className
      )}
      whileHover={{ scale: isUrgent ? 1.03 : 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={cn('p-2 sm:p-3 rounded-lg sm:rounded-xl', iconColor.replace('text-', 'bg-').replace('-600', '-100'))}>
          <Icon className={cn('w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8', iconColor)} />
        </div>
      </div>
      <h3 className={cn('text-lg sm:text-xl font-bold mb-1.5 sm:mb-2', isUrgent ? 'text-amber-900' : 'text-slate-900')}>{title}</h3>
      {subtitle && (
        <p className={cn('text-xs sm:text-sm font-medium mb-1.5 sm:mb-2', isUrgent ? 'text-amber-700' : 'text-slate-700')}>{subtitle}</p>
      )}
      {description && (
        <p className={cn('text-xs leading-relaxed hidden sm:block', isUrgent ? 'text-amber-600' : 'text-slate-500')}>{description}</p>
      )}
    </motion.div>
  );
}
