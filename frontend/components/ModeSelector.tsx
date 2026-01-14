'use client';

import { Mode } from '@/lib/types';
import { Download, Upload, Move } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  const modes: Array<{ value: Mode; label: string; icon: React.ReactNode; color: string; activeColor: string }> = [
    {
      value: 'INBOUND',
      label: 'INBOUND',
      icon: <Download className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      activeColor: 'bg-blue-600 text-white shadow-md',
    },
    {
      value: 'OUTBOUND',
      label: 'OUTBOUND',
      icon: <Upload className="w-5 h-5" />,
      color: 'bg-red-100 text-red-700 hover:bg-red-200',
      activeColor: 'bg-red-600 text-white shadow-md',
    },
    {
      value: 'MOVE',
      label: 'MOVE',
      icon: <Move className="w-5 h-5" />,
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      activeColor: 'bg-green-600 text-white shadow-md',
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {modes.map((m) => (
        <motion.button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
            mode === m.value ? m.activeColor : m.color
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {m.icon}
          {m.label}
        </motion.button>
      ))}
    </div>
  );
}
