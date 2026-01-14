'use client';

import { motion } from 'framer-motion';
import { Download, Upload, Move, Clock, Activity, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import { RecentEvent } from '@/lib/api';

export default function RecentActivityFeed() {
  const { stats, loading } = useStats();
  const events: RecentEvent[] = stats?.recent_events || [];

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
        return 'text-blue-500';
      case 'OUT':
        return 'text-purple-500';
      case 'MOVE':
        return 'text-green-500';
      default:
        return 'text-slate-500';
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
    if (!timestamp) return 'Unknown';
    
    try {
      // Parse timestamp - ensure it's treated as UTC if no timezone info
      let timestampStr = timestamp;
      
      // If timestamp doesn't have timezone info, assume it's UTC
      if (!timestampStr.includes('Z') && !timestampStr.includes('+') && !timestampStr.includes('-', 10)) {
        timestampStr = timestampStr + 'Z';
      }
      
      const date = new Date(timestampStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      // Handle future dates (shouldn't happen, but show time)
      if (diffMs < 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      // More precise "just now" - only if less than 30 seconds
      if (diffSecs < 30) return 'Just now';
      if (diffMins < 1) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      // For older dates, show date and time in local timezone
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="animate-pulse space-y-2.5">
          <div className="h-4 bg-slate-100 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-slate-700">Recent Activity</h3>
        </div>
        <div className="text-center py-6">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-3">No recent activity</p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Start scanning
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-slate-700">Recent Activity</h3>
        <Link
          href="/activity"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-2">
        {events.map((event, index) => {
          const Icon = getEventIcon(event.event_type);
          const colorClass = getEventColor(event.event_type);
          
          return (
            <motion.div
              key={event.event_id}
              className="flex items-center gap-2.5 p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', colorClass)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                    {getEventLabel(event.event_type)}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {event.product.brand} - {event.product.name}
                    {event.product.size && <span className="text-slate-400 ml-1">({event.product.size})</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-mono">{event.box_id}</span>
                  {event.location_code && (
                    <>
                      <span>•</span>
                      <span>{event.location_code}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 ml-2 flex-shrink-0">
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
