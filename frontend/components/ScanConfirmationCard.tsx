'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { Event, Location, BoxDetails, ExceptionType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ScanConfirmationCardProps {
  event?: Event | null;
  boxDetails?: BoxDetails | null;
  location?: Location | null;
  onDismiss?: () => void;
}

export default function ScanConfirmationCard({
  event,
  boxDetails,
  location,
  onDismiss,
}: ScanConfirmationCardProps) {
  if (!event && !location) return null;

  // For location scans (MOVE step 1)
  if (location && !event) {
    return (
      <AnimatePresence>
        <motion.div
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="flex items-start gap-6">
                <motion.div
                  className="p-3 bg-green-100 rounded-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
            <div className="flex-1">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 mb-3 sm:mb-4">Location Scanned</h3>
              <div className="bg-white rounded-xl p-6 border border-green-100 shadow-sm">
                    <div className="text-2xl sm:text-3xl font-bold text-green-900 mb-3 sm:mb-4">{location.location_code}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Zone</span>
                    <span className="font-semibold text-slate-900">{location.zone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Aisle</span>
                    <span className="font-semibold text-slate-900">{location.aisle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Rack</span>
                    <span className="font-semibold text-slate-900">{location.rack}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Shelf</span>
                    <span className="font-semibold text-slate-900">{location.shelf}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // For box scans
  if (event && boxDetails) {
    const displayLocation = location || boxDetails.current_location;
    const status = boxDetails.status || 'UNKNOWN';
    const statusColor = status === 'IN_STOCK' ? 'green' : 'gray';
    const statusBg = status === 'IN_STOCK' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';

    return (
      <AnimatePresence>
        <motion.div
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="flex items-start gap-6">
                <motion.div
                  className="p-3 bg-green-100 rounded-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 mb-1 sm:mb-2">
                        {event.product.brand}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl text-green-800 font-semibold">{event.product.name}</p>
                </div>
                <div className={cn(
                  'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide',
                  statusBg
                )}>
                  {status.replace('_', ' ')}
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-green-100 shadow-sm space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {event.product.size && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Size:</span>
                    <span className="font-semibold text-slate-900">{event.product.size}</span>
                  </div>
                )}
                {event.lot_code && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Lot Code:</span>
                    <span className="font-semibold text-slate-900 font-mono">{event.lot_code}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">Box ID:</span>
                  <span className="font-mono font-bold text-slate-900">{event.box_id}</span>
                </div>
                {displayLocation && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm pt-2 sm:pt-3 border-t border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 font-medium">Location:</span>
                    <span className="font-semibold text-slate-900">{displayLocation.location_code}</span>
                  </div>
                )}
              </div>

              {event.exception_type && (
                <motion.div
                  className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900">
                        {event.exception_type === 'OUT_WITHOUT_IN'
                          ? 'Warning: Box was never received (no IN event found)'
                          : event.warning || `Exception: ${event.exception_type}`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {event.warning && !event.exception_type && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-900">{event.warning}</p>
                </div>
              )}

                  {onDismiss && (
                    <motion.button
                      onClick={onDismiss}
                      className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl min-h-[44px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Dismiss
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
