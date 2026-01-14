'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getExceptions } from '@/lib/api';
import Link from 'next/link';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Filter, Package, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SkeletonTableRow } from '@/components/SkeletonLoader';
import PageTransition from '@/components/PageTransition';
import PageHeader from '@/components/PageHeader';

interface Exception {
  event_id: string;
  timestamp: string;
  box_id: string;
  event_type: string;
  exception_type: string;
  warning?: string;
  product?: {
    brand: string;
    name: string;
    size?: string;
  };
}

export default function ExceptionsPage() {
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    if (!isAdmin) {
      router.push('/scan');
      return;
    }
    loadExceptions();
  }, [filter, isAdmin, router]);

  const loadExceptions = async () => {
    try {
      setLoading(true);
      const data = await getExceptions({
        exception_type: filter || undefined,
        limit: 100,
      });
      setExceptions(data);
    } catch (error: any) {
      toast.error('Failed to load exceptions');
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
          title="Exceptions"
          subtitle="Review warehouse events that require attention. Exceptions occur when operations don't follow standard workflow rules."
        />

        <motion.div
          className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2 text-amber-900">Common exception types:</p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-amber-800">
                <li><strong>OUT_WITHOUT_IN:</strong> Box shipped without being received first (may indicate missing receipt scan)</li>
                <li><strong>MOVE_WHEN_OUT:</strong> Attempted to move a box that's already out of warehouse</li>
                <li><strong>DUPLICATE_SCAN:</strong> Same event processed multiple times (usually safe to ignore)</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Exception Type
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">All Exceptions</option>
            <option value="OUT_WITHOUT_IN">OUT without IN</option>
            <option value="MOVE_WHEN_OUT">MOVE when OUT</option>
            <option value="DUPLICATE_SCAN">Duplicate Scan</option>
          </select>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Box ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Exception
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Warning
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Box ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Exception
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Warning
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {exceptions.map((exception, index) => (
                  <motion.tr
                    key={exception.event_id}
                    className="hover:bg-slate-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(exception.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/boxes/${exception.box_id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        {exception.box_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {exception.product ? (
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {exception.product.brand} - {exception.product.name}
                          </div>
                          {exception.product.size && (
                            <div className="text-sm text-slate-600">{exception.product.size}</div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full',
                          exception.event_type === 'IN'
                            ? 'bg-green-100 text-green-800'
                            : exception.event_type === 'OUT'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        )}
                      >
                        {exception.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-amber-100 text-amber-800">
                        {exception.exception_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {exception.warning || '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {exceptions.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-900 mb-2">No exceptions found</p>
                <p className="text-sm text-slate-600">All warehouse operations are following standard workflow rules</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
