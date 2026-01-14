'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Package, XCircle, CheckCircle2, ArrowRight, QrCode } from 'lucide-react';
import { Location } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: 1 | 2;
  location?: Location | null;
  onClear?: () => void;
  mode: 'INBOUND' | 'OUTBOUND' | 'MOVE';
}

export default function StepIndicator({ currentStep, location, onClear, mode }: StepIndicatorProps) {
  if (mode === 'MOVE') {
    if (currentStep === 1) {
      return (
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 mb-8 shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl shadow-lg flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-xl text-blue-900">Step 1: Scan Location QR</h3>
              </div>
              <p className="text-base text-blue-800 mb-3">
                Find the location QR code on the shelf where you want to place the box.
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-200 mb-3">
                <p className="text-sm font-semibold text-slate-700 mb-2">What to look for:</p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>QR code sticker on the shelf or rack</li>
                  <li>Starts with "LOC:" when scanned</li>
                  <li>Shows location code like "11-1-3" (Zone-Aisle-Rack-Shelf)</li>
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                <ArrowRight className="w-4 h-4" />
                <span>After scanning, you'll scan the box QR code in Step 2</span>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <AnimatePresence>
        {location && (
          <motion.div
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-8 shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Step 1 Complete */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-green-200">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white font-bold text-xl shadow-lg flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-lg text-green-900">Location Scanned ✓</h3>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-900 mb-2">{location.location_code}</div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
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
              {onClear && (
                <motion.button
                  onClick={onClear}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold shadow-sm flex-shrink-0"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <XCircle className="w-4 h-4" />
                  Change Location
                </motion.button>
              )}
            </div>

            {/* Step 2 Active */}
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl shadow-lg flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-xl text-blue-900">Step 2: Scan Box QR</h3>
                </div>
                <p className="text-base text-blue-800 mb-3">
                  Now scan the box QR code from the label on the box you want to move here.
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2">What to look for:</p>
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>QR code on the box label</li>
                    <li>Starts with "BOX:" when scanned</li>
                    <li>Contains box ID like "BX-20260113-000021"</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // For INBOUND and OUTBOUND modes
  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 mb-8 shadow-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl shadow-lg flex-shrink-0">
          1
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-xl text-blue-900">
              {mode === 'INBOUND' ? 'Scan Box QR to Receive' : 'Scan Box QR to Ship'}
            </h3>
          </div>
          <p className="text-base text-blue-800 mb-3">
            {mode === 'INBOUND' 
              ? 'Point your camera at the box QR code on the label to register this box as received.'
              : 'Point your camera at the box QR code to mark this box as shipped.'}
          </p>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-semibold text-slate-700 mb-2">What to look for:</p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>QR code on the box label</li>
              <li>Starts with "BOX:" when scanned</li>
              <li>Contains box ID like "BX-20260113-000021"</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
