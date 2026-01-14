'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStatsToday } from '@/lib/api';
import { motion } from 'framer-motion';
import { Download, Truck, Package, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodayMetricsProps {
  onWaitingClick?: () => void;
}

export default function TodayMetrics({ onWaitingClick }: TodayMetricsProps) {
  const router = useRouter();
  const [stats, setStats] = useState<{
    received_today: number;
    shipped_today: number;
    to_put_away: number;
    exceptions_today: number;
  } | null>(null);
  const [lastSuccessAt, setLastSuccessAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const statsData = await getStatsToday();
      setStats({
        received_today: statsData.received_today,
        shipped_today: statsData.shipped_today,
        to_put_away: statsData.to_put_away,
        exceptions_today: statsData.exceptions_today,
      });
      setLastSuccessAt(new Date());
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

  const getTimeAgo = () => {
    if (!lastSuccessAt) return 'Never';
    const seconds = Math.floor((new Date().getTime() - lastSuccessAt.getTime()) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ago`;
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleReceivedTodayClick = () => {
    const today = new Date();
    const todayStr = formatLocalDate(today);
    router.push(`/inventory?date_from=${todayStr}&date_to=${todayStr}&event_type_today=IN`);
  };

  const handleShippedTodayClick = () => {
    const today = new Date();
    const todayStr = formatLocalDate(today);
    router.push(`/inventory?date_from=${todayStr}&date_to=${todayStr}&event_type_today=OUT`);
  };

  const handleWaitingClick = () => {
    if (onWaitingClick) {
      onWaitingClick();
    } else {
      router.push('/inventory?status=IN_STOCK&location=RECEIVING');
    }
  };

  const handleExceptionsClick = () => {
    router.push('/activity?show_exceptions_only=true');
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Received today',
      value: stats?.received_today ?? 0,
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      onClick: handleReceivedTodayClick,
    },
    {
      label: 'Waiting to put away',
      value: stats?.to_put_away ?? 0,
      icon: Package,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      onClick: handleWaitingClick,
    },
    {
      label: 'Shipped today',
      value: stats?.shipped_today ?? 0,
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      onClick: handleShippedTodayClick,
    },
    {
      label: 'Exceptions today',
      value: stats?.exceptions_today ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      onClick: handleExceptionsClick,
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className={cn(
                'p-4 rounded-xl border border-slate-200 cursor-pointer',
                'hover:border-blue-300 hover:shadow-md transition-all',
                'bg-white'
              )}
              onClick={metric.onClick}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('rounded-lg p-2', metric.bgColor)}>
                  <Icon className={cn('w-5 h-5', metric.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 font-medium truncate">{metric.label}</p>
                  <p className={cn('text-2xl font-bold', metric.color)}>{metric.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-4 border-t border-slate-200">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>Last synced {getTimeAgo()}</span>
      </div>
    </motion.div>
  );
}
