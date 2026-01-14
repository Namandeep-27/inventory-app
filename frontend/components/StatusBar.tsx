'use client';

import { useEffect, useState, useRef } from 'react';
import { getStatsToday, StatsToday } from '@/lib/api';
import { motion } from 'framer-motion';
import { FiDownload, FiPackage, FiMove, FiTruck } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { getLocations } from '@/lib/api';

interface StatusBarProps {
  onStatsUpdate?: (stats: StatsToday) => void;
}

export default function StatusBar({ onStatsUpdate }: StatusBarProps) {
  const [stats, setStats] = useState<StatsToday | null>(null);
  const [lastSuccessAt, setLastSuccessAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const receivingLocationIdRef = useRef<string | null>(null);

  const fetchStats = async () => {
    try {
      const statsData = await getStatsToday();
      setStats(statsData);
      setLastSuccessAt(new Date());
      onStatsUpdate?.(statsData);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      console.error('Error details:', error?.response?.data || error?.message);
      // Set loading to false so we can show data even if fetch fails temporarily
      // The interval will retry every 10 seconds
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getTimeAgo = () => {
    if (!lastSuccessAt) return 'Never';
    const seconds = Math.floor((new Date().getTime() - lastSuccessAt.getTime()) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ago`;
  };

  const handleToPutAwayClick = async () => {
    // Get RECEIVING location_id
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">System Status</h2>
        <div className="text-xs text-gray-500">
          <span>Last synced {getTimeAgo()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Received Today - Clickable */}
        <motion.div
          onClick={handleReceivedTodayClick}
          className="bg-blue-50 rounded-lg p-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FiDownload className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Received today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.received_today ?? 0}</div>
          <div className="text-xs text-gray-600 mt-0.5">Boxes scanned IN</div>
        </motion.div>
        
        {/* To Put Away - Clickable */}
        <motion.div
          onClick={handleToPutAwayClick}
          className="bg-amber-50 rounded-lg p-3 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FiPackage className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-gray-700">To put away</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.to_put_away ?? 0}</div>
          <div className="text-xs text-gray-600 mt-0.5">Yet to move to shelf</div>
        </motion.div>
        
        {/* Moved Today - Clickable */}
        <motion.div
          onClick={handleMovedTodayClick}
          className="bg-green-50 rounded-lg p-3 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FiMove className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-700">Moved today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.moved_today ?? 0}</div>
          <div className="text-xs text-gray-600 mt-0.5">Put-away scans</div>
        </motion.div>
        
        {/* Shipped Today - Clickable */}
        <motion.div
          onClick={handleShippedTodayClick}
          className="bg-purple-50 rounded-lg p-3 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FiTruck className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-700">Shipped today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.shipped_today ?? 0}</div>
          <div className="text-xs text-gray-600 mt-0.5">Outbound scans</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
