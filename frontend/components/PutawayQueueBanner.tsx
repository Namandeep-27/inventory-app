'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStatsToday } from '@/lib/api';
import { motion } from 'framer-motion';
import { Package, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PutawayQueueBannerProps {
  onStartMove: () => void;
  onStartReceive?: () => void;
}

const HIGH_THRESHOLD = 10; // Show orange/red when waiting > 10

export default function PutawayQueueBanner({ onStartMove, onStartReceive }: PutawayQueueBannerProps) {
  const router = useRouter();
  const [toPutAway, setToPutAway] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const statsData = await getStatsToday();
      setToPutAway(statsData.to_put_away);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 9 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 9000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading && toPutAway === null) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const count = toPutAway ?? 0;
  
  // Determine state: 0 (green), 1-N (yellow), high (orange/red)
  let state: 'empty' | 'normal' | 'high';
  let bgColor: string;
  let borderColor: string;
  let textColor: string;
  let iconBg: string;
  let iconColor: string;
  let Icon: typeof Package;

  if (count === 0) {
    state = 'empty';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    textColor = 'text-green-900';
    iconBg = 'bg-green-100';
    iconColor = 'text-green-600';
    Icon = CheckCircle2;
  } else if (count >= HIGH_THRESHOLD) {
    state = 'high';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-300';
    textColor = 'text-orange-900';
    iconBg = 'bg-orange-100';
    iconColor = 'text-orange-600';
    Icon = AlertTriangle;
  } else {
    state = 'normal';
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-300';
    textColor = 'text-amber-900';
    iconBg = 'bg-amber-100';
    iconColor = 'text-amber-600';
    Icon = Package;
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl shadow-lg border-2 p-6 mb-8',
        bgColor,
        borderColor
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={cn('rounded-xl p-4', iconBg)}>
            <Icon className={cn('w-8 h-8', iconColor)} />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-2">
              <span className={cn('text-4xl font-bold', textColor)}>{count}</span>
              <span className={cn('text-lg font-semibold', textColor)}>
                {count === 0 
                  ? 'boxes waiting for put-away'
                  : count === 1 
                  ? 'box waiting for put-away'
                  : 'boxes waiting for put-away'}
              </span>
            </div>
            <p className={cn('text-sm', textColor.replace('900', '700'))}>
              {count === 0 
                ? 'All caught up! Ready to receive new boxes.'
                : count >= HIGH_THRESHOLD
                ? 'Falling behind — prioritize put-away tasks'
                : 'Scan boxes first, then put-away in batches.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {count > 0 ? (
            <motion.button
              onClick={onStartMove}
              className={cn(
                'flex items-center gap-2 px-6 py-3 text-white rounded-xl',
                'font-semibold shadow-lg transition-colors whitespace-nowrap',
                state === 'high' 
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Start Put-away</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              onClick={() => {
                if (onStartReceive) {
                  onStartReceive();
                } else {
                  router.push('/inventory?status=IN_STOCK&location=RECEIVING');
                }
              }}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl',
                'font-semibold shadow-lg transition-colors whitespace-nowrap',
                'bg-green-600 text-white hover:bg-green-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Go to Receive</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
