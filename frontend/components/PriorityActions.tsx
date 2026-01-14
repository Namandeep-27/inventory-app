'use client';

import { useEffect, useState } from 'react';
import { getStatsToday } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityActionsProps {
  onStartMove: () => void;
}

export default function PriorityActions({ onStartMove }: PriorityActionsProps) {
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

  // Only show when there are boxes to put away
  if (loading || !toPutAway || toPutAway === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8 shadow-lg"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <motion.div
              className="bg-amber-100 rounded-xl p-4"
              animate={{ scale: [1, 1.05] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              <Package className="w-8 h-8 text-amber-700" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-amber-900">{toPutAway}</span>
                <span className="text-lg font-semibold text-amber-800">
                  {toPutAway === 1 ? 'box' : 'boxes'} waiting in RECEIVING
                </span>
              </div>
              <p className="text-sm text-amber-700">
                These boxes need to be moved to their shelf locations
              </p>
            </div>
          </div>
          <motion.button
            onClick={onStartMove}
            className={cn(
              'flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl',
              'hover:bg-amber-700 font-semibold shadow-lg transition-colors',
              'whitespace-nowrap'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Start Moving</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
