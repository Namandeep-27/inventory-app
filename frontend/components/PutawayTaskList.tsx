'use client';

import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import { WaitingPutawayPreviewItem } from '@/lib/api';

interface PutawayTaskListProps {
  onPutAway: (boxId: string) => void;
}

export default function PutawayTaskList({ onPutAway }: PutawayTaskListProps) {
  const { stats, loading } = useStats();
  const preview: WaitingPutawayPreviewItem[] = stats?.waiting_putaway_preview || [];

  const getWaitingTime = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    
    let eventTime: Date;
    try {
      // Handle ISO string timestamps (with or without Z)
      const timestampStr = timestamp.includes('Z') || timestamp.includes('+') 
        ? timestamp 
        : timestamp + 'Z';
      eventTime = new Date(timestampStr);
      
      if (isNaN(eventTime.getTime())) {
        // Try parsing without Z if that failed
        eventTime = new Date(timestamp);
        if (isNaN(eventTime.getTime())) {
          return 'Unknown';
        }
      }
    } catch (e) {
      return 'Unknown';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - eventTime.getTime();
    
    // Handle negative differences (future dates) - shouldn't happen but show something
    if (diffMs < 0) {
      return 'Just now';
    }
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // More precise time display
    if (diffSecs < 30) return 'Just now';
    if (diffMins < 1) return `${diffSecs}s`;
    if (diffMins < 60) {
      // Show minutes with precision
      return `${diffMins} min`;
    }
    if (diffHours < 24) {
      // Show hours with minutes if less than 2 hours
      if (diffHours < 2) {
        const remainingMins = diffMins % 60;
        if (remainingMins > 0) {
          return `${diffHours} hr ${remainingMins} min`;
        }
      }
      return `${diffHours} hr`;
    }
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 md:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (preview.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 md:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
            <CheckCircle2 className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">All caught up</h3>
          <p className="text-sm text-slate-500 mb-4">
            No boxes waiting for put-away
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Scan a box to get started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-300 p-4 sm:p-5 md:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-0.5 sm:mb-1">Put-away Queue</h3>
          <p className="text-xs sm:text-sm text-slate-600">Boxes waiting to be moved to shelves</p>
        </div>
        <Link
          href="/inventory?status=IN_STOCK&location=RECEIVING"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-2.5">
        {preview.map((item, index) => (
          <motion.div
            key={item.box_id}
            className="flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 transition-all"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-slate-200 rounded-md p-2 flex-shrink-0">
                <Package className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-slate-900 truncate text-xs sm:text-sm">
                    {item.product.brand} - {item.product.name}
                  </span>
                  {item.product.size && (
                    <span className="text-[10px] sm:text-xs text-slate-500 flex-shrink-0">{item.product.size}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono">{item.box_id}</span>
                  {item.lot_code && (
                    <>
                      <span>•</span>
                      <span>Lot {item.lot_code}</span>
                    </>
                  )}
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Waiting {getWaitingTime(item.last_event_time)}</span>
                  </div>
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => onPutAway(item.box_id)}
              className="ml-2 sm:ml-4 flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Put away</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
