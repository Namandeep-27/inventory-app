'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, AlertTriangle, Eye, XCircle } from 'lucide-react';
import { LocationOccupancy } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LocationOccupancyDialogProps {
  open: boolean;
  onClose: () => void;
  onAssignAnyway: () => void;
  onScanDifferent: () => void;
  occupancy: LocationOccupancy | null;
  loading?: boolean;
}

export default function LocationOccupancyDialog({
  open,
  onClose,
  onAssignAnyway,
  onScanDifferent,
  occupancy,
  loading = false,
}: LocationOccupancyDialogProps) {
  const router = useRouter();

  const handleViewAll = () => {
    if (occupancy) {
      // Use location_id (UUID) for filtering, not location_code
      router.push(`/inventory?location_id=${encodeURIComponent(occupancy.location_id)}&status=IN_STOCK`);
      onClose();
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 rounded-xl p-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Location already has items</h2>
                    <p className="text-sm text-slate-600">
                      {occupancy ? (
                        <>
                          <span className="font-semibold">{occupancy.active_box_count}</span> box{occupancy.active_box_count !== 1 ? 'es' : ''} already at{' '}
                          <span className="font-semibold">{occupancy.location_code}</span>
                        </>
                      ) : (
                        'Checking occupancy...'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : occupancy && occupancy.boxes.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 mb-4">
                      The following boxes are currently at this location:
                    </p>
                    {occupancy.boxes.slice(0, 5).map((box) => (
                      <div
                        key={box.box_id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {box.product_name}
                            </span>
                            {box.size && (
                              <span className="text-xs text-slate-500">{box.size}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono">{box.box_id}</span>
                            {box.lot_code && (
                              <>
                                <span>•</span>
                                <span>Lot: {box.lot_code}</span>
                              </>
                            )}
                            {box.last_moved_at && (
                              <>
                                <span>•</span>
                                <span>{formatTime(box.last_moved_at)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {occupancy.boxes.length > 5 && (
                      <p className="text-xs text-slate-500 text-center pt-2">
                        + {occupancy.boxes.length - 5} more box{occupancy.boxes.length - 5 !== 1 ? 'es' : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No boxes found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={onScanDifferent}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                    'text-slate-700 hover:bg-slate-200 font-semibold transition-colors',
                    'flex-1 justify-center'
                  )}
                >
                  <XCircle className="w-4 h-4" />
                  Scan different location
                </button>
                {occupancy && occupancy.active_box_count > 0 && (
                  <button
                    onClick={handleViewAll}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                      'text-blue-700 hover:bg-blue-100 font-semibold transition-colors',
                      'border border-blue-200'
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    View all
                  </button>
                )}
                <button
                  onClick={onAssignAnyway}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-xl',
                    'bg-amber-600 text-white hover:bg-amber-700 font-semibold transition-colors',
                    'shadow-lg'
                  )}
                >
                  Assign anyway
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
