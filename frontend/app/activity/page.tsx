'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getEvents } from '@/lib/api';
import Link from 'next/link';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Clock, Package, MapPin, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageTransition from '@/components/PageTransition';
import PageHeader from '@/components/PageHeader';

interface ActivityEvent {
  event_id: string;
  timestamp: string;
  box_id: string;
  event_type: string;
  mode: string;
  exception_type?: string;
  product?: {
    brand: string;
    name: string;
    size?: string;
  };
  locations?: {
    location_code: string;
  };
}

export default function ActivityPage() {
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExceptionsOnly, setShowExceptionsOnly] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/scan');
      return;
    }
    loadActivity();
  }, [showExceptionsOnly, isAdmin, router]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const data = await getEvents({ 
        limit: 100,
        show_exceptions_only: showExceptionsOnly 
      });
      
      // Backend already filters duplicates, so just set the events
        setEvents(data as any[]);
    } catch (error: any) {
      console.error('Failed to load activity:', error);
      console.error('Error details:', error?.response?.data || error?.message);
      toast.error(`Failed to load activity: ${error?.response?.data?.detail || error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Live Activity"
          subtitle="Monitor all warehouse events in real-time. Track box movements, shipments, and exceptions as they happen."
        />

        <motion.div
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2 text-blue-900">How to use this page:</p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-blue-800">
                <li>View all recent warehouse events including receipts, moves, and shipments</li>
                <li>Click "Refresh Now" to update the activity feed with latest events</li>
                <li>Filter to "Show exceptions only" to focus on items that need attention</li>
                <li>Click any box ID to view detailed history</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showExceptionsOnly}
                onChange={(e) => setShowExceptionsOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              Show exceptions only
            </label>
          </div>
            <motion.button
              onClick={loadActivity}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                        <div className="h-4 w-20 bg-slate-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                        <div className="h-4 w-48 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="divide-y divide-slate-200">
              {events.map((event, index) => (
                <motion.div
                  key={event.event_id}
                  className={cn(
                    'p-6 hover:bg-slate-50 transition-colors',
                    event.exception_type && 'bg-yellow-50 border-l-4 border-yellow-400'
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span
                          className={cn(
                            'px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1',
                            event.event_type === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : event.event_type === 'OUT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          )}
                        >
                          {event.event_type}
                        </span>
                        <span className="text-sm text-slate-600 font-semibold">{event.mode}</span>
                        {event.exception_type && (
                          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">
                            {event.exception_type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          href={`/boxes/${event.box_id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center gap-1.5 text-sm"
                        >
                          <Package className="w-4 h-4" />
                          {event.box_id}
                        </Link>
                        {event.product && (
                          <span className="text-slate-600 text-sm">
                            • {event.product.brand} {event.product.name}
                            {event.product.size && ` (${event.product.size})`}
                          </span>
                        )}
                        {event.locations && (
                          <span className="text-slate-500 flex items-center gap-1.5 text-sm">
                            <MapPin className="w-4 h-4" />
                            @ {event.locations.location_code}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-2 ml-6">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {(() => {
                        try {
                          // Parse timestamp - ensure it's treated as UTC if no timezone info
                          let timestampStr = event.timestamp;
                          
                          // If timestamp doesn't have timezone info, assume it's UTC
                          if (!timestampStr.includes('Z') && !timestampStr.includes('+') && !timestampStr.includes('-', 10)) {
                            timestampStr = timestampStr + 'Z';
                          }
                          
                          const date = new Date(timestampStr);
                          
                          // Check if date is valid
                          if (isNaN(date.getTime())) {
                            return 'Invalid date';
                          }
                          
                          // Format in user's local timezone
                          // JavaScript Date automatically converts UTC to local time
                          return date.toLocaleString('en-US', {
                            month: 'numeric',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          });
                        } catch (e) {
                          return 'Invalid date';
                        }
                      })()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {events.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Activity className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-900 mb-2">No activity found</p>
                <p className="text-sm text-slate-600">Activity will appear here as warehouse events occur</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
