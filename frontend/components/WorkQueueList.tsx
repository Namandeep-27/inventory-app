'use client';

import { useEffect, useState } from 'react';
import { getStatsToday, WaitingPutawayPreviewItem } from '@/lib/api';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function WorkQueueList() {
  const [preview, setPreview] = useState<WaitingPutawayPreviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const statsData = await getStatsToday();
      setPreview(statsData.waiting_putaway_preview || []);
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

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    const eventTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (preview.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up</h3>
          <p className="text-sm text-slate-600">
            No boxes are currently waiting for put-away
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Put-away Queue</h3>
        <Link
          href="/inventory?status=IN_STOCK&location=RECEIVING"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {preview.map((item, index) => (
          <motion.div
            key={item.box_id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-blue-100 rounded-lg p-2">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 truncate">
                    {item.product.brand} - {item.product.name}
                  </span>
                  {item.product.size && (
                    <span className="text-sm text-slate-500">{item.product.size}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono">{item.box_id}</span>
                  {item.lot_code && (
                    <>
                      <span>•</span>
                      <span>Lot: {item.lot_code}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 ml-4">
              <Clock className="w-3 h-3" />
              <span>{getTimeAgo(item.last_event_time)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
