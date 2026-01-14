'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getStatsToday, StatsToday } from '@/lib/api';

interface StatsContextType {
  stats: StatsToday | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsToday | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const statsData = await getStatsToday();
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch stats');
      console.error('Failed to fetch stats:', error);
      setError(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Auto-refresh every 9 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 9000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchStats]);

  return (
    <StatsContext.Provider value={{ stats, loading, error, refresh: fetchStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}
