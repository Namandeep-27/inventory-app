'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStats } from '@/hooks/useStats';

interface WorkStatusBannerProps {
  onStartMove: () => void;
}

export default function WorkStatusBanner({ onStartMove }: WorkStatusBannerProps) {
  const router = useRouter();
  const { stats, loading } = useStats();
  const [lastSuccessAt, setLastSuccessAt] = useState<Date | null>(null);

  // Update lastSuccessAt when stats load
  useEffect(() => {
    if (stats && !loading) {
      setLastSuccessAt(new Date());
    }
  }, [stats, loading]);

  const getTimeAgo = () => {
    if (!lastSuccessAt) return 'Never';
    const seconds = Math.floor((new Date().getTime() - lastSuccessAt.getTime()) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ago`;
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          <div className="h-9 bg-slate-200 rounded w-28"></div>
        </div>
      </div>
    );
  }

  const count = stats?.to_put_away ?? 0;
  
  // Determine state: 0 (green/neutral), >0 (warm warning)
  const isEmpty = count === 0;
  
  return (
    <motion.div
      className={cn(
        'rounded-xl sm:rounded-2xl shadow-sm border p-3 sm:p-4 md:p-5 mb-4 sm:mb-6',
        isEmpty
          ? 'bg-slate-50 border-slate-200'
          : 'bg-amber-50 border-amber-200'
      )}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            'rounded-lg p-2.5',
            isEmpty ? 'bg-slate-100' : 'bg-amber-100'
          )}>
            {isEmpty ? (
              <CheckCircle2 className="w-5 h-5 text-slate-600" />
            ) : (
              <Package className="w-5 h-5 text-amber-700" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              {isEmpty ? (
                <span className="text-base sm:text-lg font-semibold text-slate-900">
                  All caught up
                </span>
              ) : (
                <>
                  <span className="text-xl sm:text-2xl font-bold text-amber-900">{count}</span>
                  <span className="text-sm sm:text-base font-medium text-amber-800">
                    {count === 1 ? 'box' : 'boxes'} waiting
                  </span>
                </>
              )}
            </div>
            <p className={cn(
              'text-[10px] sm:text-xs',
              isEmpty ? 'text-slate-600' : 'text-amber-700'
            )}>
              {isEmpty 
                ? 'No boxes waiting. Ready to receive.'
                : 'Scan boxes first, then put-away.'}
            </p>
            {/* Sync status - subtle secondary line */}
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
              Last synced {getTimeAgo()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEmpty ? (
            <motion.button
              onClick={() => router.push('/activity')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'text-sm font-medium transition-colors',
                'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Activity className="w-4 h-4" />
              <span>View activity</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={onStartMove}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-amber-600 text-white rounded-lg',
                'text-xs sm:text-sm font-semibold shadow-sm transition-colors whitespace-nowrap',
                'hover:bg-amber-700 min-h-[44px]'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Start Put-away</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
