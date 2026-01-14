'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getBox } from '@/lib/api';
import { BoxDetails } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, ArrowLeft, CheckCircle, XCircle, Move, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHeader from '@/components/PageHeader';

export default function BoxDetailsPage() {
  const params = useParams();
  const boxId = params.box_id as string;
  const [box, setBox] = useState<BoxDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (boxId) {
      loadBox();
    }
  }, [boxId]);

  const loadBox = async () => {
    try {
      setLoading(true);
      const data = await getBox(boxId);
      setBox(data);
    } catch (error: any) {
      toast.error('Failed to load box details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
            <LoadingSpinner size="lg" className="mx-auto" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!box) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-semibold text-slate-900 mb-2">Box not found</p>
            <p className="text-sm text-slate-600 mb-6">The box ID you're looking for doesn't exist in the system</p>
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Inventory
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'IN':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'OUT':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'MOVE':
        return <Move className="w-5 h-5 text-blue-600" />;
      default:
        return <Package className="w-5 h-5 text-slate-600" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'IN':
        return 'border-green-500 bg-green-50';
      case 'OUT':
        return 'border-red-500 bg-red-50';
      case 'MOVE':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-slate-300 bg-slate-50';
    }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Box Details"
          subtitle={`Complete information and full history for box ${box.box_id}`}
        >
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold rounded-xl hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
      </Link>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Product Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Brand</p>
                <p className="text-2xl font-bold text-slate-900">{box.product.brand}</p>
              </div>
          <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Product Name</p>
                <p className="text-lg text-slate-700 font-semibold">{box.product.name}</p>
              </div>
            {box.product.size && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Size</p>
                  <p className="text-base text-slate-700 font-medium">{box.product.size}</p>
                </div>
            )}
            {box.lot_code && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Lot Code</p>
                  <p className="text-base font-mono font-semibold text-slate-900">{box.lot_code}</p>
                </div>
            )}
          </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Current Status
            </h2>
            <div className="space-y-4">
          <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Inventory Status</p>
              <span
                  className={cn(
                    'px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-full',
                  box.status === 'IN_STOCK'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  )}
              >
                  {box.status === 'IN_STOCK' ? 'In Stock' : 'Out of Warehouse'}
              </span>
              </div>
            {box.current_location && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Current Location</p>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <p className="text-base font-semibold text-slate-900">{box.current_location.location_code}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Zone {box.current_location.zone} • Aisle {box.current_location.aisle} • Rack {box.current_location.rack} • Shelf {box.current_location.shelf}
              </p>
                </div>
            )}
          </div>
          </motion.div>
        </div>

        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              Complete Event History
            </h2>
            <span className="text-sm text-slate-600 font-semibold">{box.events.length} event{box.events.length !== 1 ? 's' : ''}</span>
      </div>

          <motion.div
            className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-2 text-blue-900">Event history:</p>
                <p className="text-sm text-blue-800">This shows the complete audit trail of all events for this box, from creation to current status. Events are shown in chronological order (newest first).</p>
              </div>
            </div>
          </motion.div>

        <div className="space-y-4">
            {box.events.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-900 mb-2">No events found</p>
                <p className="text-sm text-slate-600">This box hasn't had any warehouse events yet</p>
              </div>
            ) : (
              box.events.map((event: any, index: number) => (
                <motion.div
              key={event.event_id}
                  className={cn('border-l-4 pl-6 py-5 rounded-r-xl', getEventColor(event.event_type))}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.2 }}
            >
              <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {getEventIcon(event.event_type)}
                        <span className="font-bold text-slate-900">
                          {event.event_type} Event
                        </span>
                        <span className="text-sm text-slate-600 font-semibold">({event.mode})</span>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600 ml-7">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                    {new Date(event.timestamp).toLocaleString()}
                        </div>
                  {event.locations && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                      Location: {event.locations.location_code}
                          </div>
                  )}
                  {event.exception_type && (
                          <div className="flex items-center gap-2 mt-3">
                            <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                      Exception: {event.exception_type}
                            </span>
                          </div>
                  )}
                  {event.warning && (
                          <div className="mt-3 p-3 bg-amber-100 border-2 border-amber-200 rounded-xl text-xs font-medium text-amber-900">
                            {event.warning}
                          </div>
                  )}
                </div>
              </div>
            </div>
                </motion.div>
              ))
          )}
        </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
