'use client';

import { motion } from 'framer-motion';
import { FiArrowRight, FiDownload, FiMove, FiUpload } from 'react-icons/fi';

export default function ScanGuidance() {
  return (
    <motion.div
      className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FiDownload className="w-4 h-4 text-blue-600" />
          <span>Receiving a delivery</span>
          <FiArrowRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">Receive</span>
        </div>
        
        <div className="flex items-center gap-2">
          <FiMove className="w-4 h-4 text-green-600" />
          <span>Putting boxes on shelves</span>
          <FiArrowRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">Move</span>
        </div>
        
        <div className="flex items-center gap-2">
          <FiUpload className="w-4 h-4 text-red-600" />
          <span>Shipping boxes out</span>
          <FiArrowRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">Outgoing</span>
        </div>
      </div>
    </motion.div>
  );
}
