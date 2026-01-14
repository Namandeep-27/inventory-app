'use client';

import { useEffect, useState } from 'react';
import { getStatsToday, RecentEvent } from '@/lib/api';
import { motion } from 'framer-motion';
import { Download, Upload, Move, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RecentActivityMiniFeed() {
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const statsData = await getStatsToday();
      setEvents(statsData.recent_events || []);
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

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'IN':
        return Download;
      case 'OUT':
        return Upload;
      case 'MOVE':
        return Move;
      default:
        return Activity;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'IN':
        return 'text-blue-600 bg-blue-100';
      case 'OUT':
        return 'text-purple-600 bg-purple-100';
      case 'MOVE':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'IN':
        return 'Received';
      case 'OUT':
        return 'Shipped';
      case 'MOVE':
        return 'Moved';
      default:
        return eventType;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No recent activity</p>
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
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
        <Link
          href="/activity"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {events.map((event, index) => {
          const Icon = getEventIcon(event.event_type);
          const colorClass = getEventColor(event.event_type);
          
          return (
            <motion.div
              key={event.event_id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={cn('rounded-lg p-2', colorClass)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    {getEventLabel(event.event_type)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {event.product.brand} - {event.product.name}
                    {event.product.size && <span className="text-slate-400 ml-1">({event.product.size})</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono">{event.box_id}</span>
                  {event.location_code && (
                    <>
                      <span>•</span>
                      <span>{event.location_code}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
                <Clock className="w-3 h-3" />
                <span>{formatTime(event.timestamp)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
