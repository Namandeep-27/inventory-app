'use client';

import { useEffect, useState, useRef } from 'react';
import { getStatsToday, StatsToday } from '@/lib/api';
import { motion } from 'framer-motion';
import { Download, Package, Move, Truck, Clock, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLocations } from '@/lib/api';
import { cn } from '@/lib/utils';

interface StatusSnapshotProps {
  onStatsUpdate?: (stats: StatsToday) => void;
}

export default function StatusSnapshot({ onStatsUpdate }: StatusSnapshotProps) {
  const [stats, setStats] = useState<StatsToday | null>(null);
  const [lastSuccessAt, setLastSuccessAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const router = useRouter();
  const receivingLocationIdRef = useRef<string | null>(null);

  const fetchStats = async () => {
    try {
      const statsData = await getStatsToday();
      setStats(statsData);
      setLastSuccessAt(new Date());
      setIsConnected(true);
      onStatsUpdate?.(statsData);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      setIsConnected(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 8-10 seconds (using 9s)
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

  const handleToPutAwayClick = async () => {
    if (!receivingLocationIdRef.current) {
      try {
        const locations = await getLocations();
        const receiving = locations.find((loc) => loc.location_code === 'RECEIVING');
        if (receiving) {
          receivingLocationIdRef.current = receiving.location_id;
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    }

    if (receivingLocationIdRef.current) {
      router.push(`/inventory?status=IN_STOCK&location_id=${receivingLocationIdRef.current}`);
    } else {
      router.push('/inventory?status=IN_STOCK');
    }
  };

  const handleReceivedTodayClick = () => {
    router.push('/inventory?event_type_today=IN');
  };

  const handleMovedTodayClick = () => {
    router.push('/inventory?event_type_today=MOVE');
  };

  const handleShippedTodayClick = () => {
    router.push('/inventory?event_type_today=OUT');
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tiles = [
    {
      label: 'Received today',
      value: stats?.received_today ?? 0,
      subtitle: 'Boxes scanned IN',
      icon: Download,
      color: 'blue',
      onClick: handleReceivedTodayClick,
    },
    {
      label: 'To put away',
      value: stats?.to_put_away ?? 0,
      subtitle: 'Yet to move to shelf',
      icon: Package,
      color: 'amber',
      onClick: handleToPutAwayClick,
    },
    {
      label: 'Moved today',
      value: stats?.moved_today ?? 0,
      subtitle: 'Put-away scans',
      icon: Move,
      color: 'green',
      onClick: handleMovedTodayClick,
    },
    {
      label: 'Shipped today',
      value: stats?.shipped_today ?? 0,
      subtitle: 'Outbound scans',
      icon: Truck,
      color: 'purple',
      onClick: handleShippedTodayClick,
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-600',
    amber: 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-600',
    green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-600',
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-600',
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Status Snapshot</h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {isConnected ? (
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600 font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-600 font-medium">Disconnected</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last synced {getTimeAgo()}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((tile, index) => {
          const Icon = tile.icon;
          return (
            <motion.div
              key={tile.label}
              onClick={tile.onClick}
              className={cn(
                'rounded-xl p-4 border cursor-pointer transition-all',
                colorClasses[tile.color as keyof typeof colorClasses]
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-700">{tile.label}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{tile.value}</div>
              <div className="text-xs text-slate-600">{tile.subtitle}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
