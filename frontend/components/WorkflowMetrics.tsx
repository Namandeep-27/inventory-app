'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Truck, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStats } from '@/hooks/useStats';

interface WorkflowMetricsProps {
  onWaitingClick?: () => void;
}

export default function WorkflowMetrics({ onWaitingClick }: WorkflowMetricsProps) {
  const router = useRouter();
  const { stats, loading } = useStats();

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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
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
      iconBg: 'bg-blue-50',
      borderColor: 'border-slate-200',
      onClick: handleReceivedTodayClick,
    },
    {
      label: 'Waiting to put away',
      value: stats?.to_put_away ?? 0,
      icon: Package,
      color: (stats?.to_put_away ?? 0) > 0 ? 'text-amber-600' : 'text-slate-600',
      iconBg: (stats?.to_put_away ?? 0) > 0 ? 'bg-amber-50' : 'bg-slate-50',
      borderColor: (stats?.to_put_away ?? 0) > 0 ? 'border-amber-200' : 'border-slate-200',
      onClick: handleWaitingClick,
    },
    {
      label: 'Shipped today',
      value: stats?.shipped_today ?? 0,
      icon: Truck,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50',
      borderColor: 'border-slate-200',
      onClick: handleShippedTodayClick,
    },
    {
      label: 'Exceptions today',
      value: stats?.exceptions_today ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      iconBg: 'bg-red-50',
      borderColor: 'border-slate-200',
      onClick: handleExceptionsClick,
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 md:p-5 mb-4 sm:mb-6"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className={cn(
                'p-3.5 rounded-lg border cursor-pointer',
                'hover:border-slate-300 hover:shadow-sm transition-all',
                'bg-white',
                metric.borderColor
              )}
              onClick={metric.onClick}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn('rounded-md p-1.5', metric.iconBg)}>
                  <Icon className={cn('w-4 h-4', metric.color)} />
                </div>
              </div>
              <div>
                <p className={cn('text-xl sm:text-2xl font-bold mb-0.5', metric.color)}>
                  {metric.value}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-tight">
                  {metric.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
