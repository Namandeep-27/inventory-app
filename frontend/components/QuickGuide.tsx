'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Info, QrCode, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuickGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const containerVariants = {
    collapsed: {
      height: 'auto',
    },
    expanded: {
      height: 'auto',
    },
  };

  const cardVariants = {
    collapsed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    expanded: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const chevronVariants = {
    collapsed: {
      rotate: 0,
    },
    expanded: {
      rotate: 180,
    },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header - Always visible, clickable */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
        whileHover={{ backgroundColor: 'rgba(248, 250, 252, 1)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">How to use this system</h3>
            <p className="text-sm text-slate-600 mt-0.5">
              {isExpanded ? 'Click to collapse' : 'Click to learn about Box QR and Location QR codes'}
            </p>
          </div>
        </div>
        <motion.div
          variants={chevronVariants}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </motion.button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={containerVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
              staggerChildren: 0.1,
              delayChildren: 0.1,
            }}
            className="border-t border-slate-100"
          >
            <div className="p-5 pt-6">
              <p className="text-sm text-slate-600 mb-6">
                This system uses two types of QR codes. Here's what each one does:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Box QR Explanation */}
                <motion.div
                  variants={cardVariants}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className="p-2.5 bg-blue-100 rounded-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Package className="w-5 h-5 text-blue-600" />
                    </motion.div>
                    <h4 className="font-bold text-slate-900">Box QR Code</h4>
                  </div>
                  <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                    Found on every box label. Contains the box ID (like BX-20260113-000021).
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-blue-200 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <span className="font-mono font-semibold">BOX:BX-20260113-000021</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Use this when: Receiving boxes, Moving boxes, Shipping boxes
                  </p>
                </motion.div>

                {/* Location QR Explanation */}
                <motion.div
                  variants={cardVariants}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className="p-2.5 bg-green-100 rounded-lg"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MapPin className="w-5 h-5 text-green-600" />
                    </motion.div>
                    <h4 className="font-bold text-slate-900">Location QR Code</h4>
                  </div>
                  <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                    Found on shelves, racks, or storage areas. Shows where boxes are stored.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <QrCode className="w-4 h-4 text-green-600" />
                      <span className="font-mono font-semibold">LOC:11-1-3</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Use this when: Moving boxes to a new shelf location
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
