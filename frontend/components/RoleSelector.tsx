'use client';

import { useUserRole } from '@/contexts/UserRoleContext';
import { Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function RoleSelector() {
  const { role, setRole } = useUserRole();

  return (
    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
      <motion.button
        onClick={() => setRole('ADMIN')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all',
          role === 'ADMIN'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-slate-600 hover:text-slate-900'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Shield className="w-4 h-4" />
        Admin
      </motion.button>
      <motion.button
        onClick={() => setRole('EMPLOYEE')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all',
          role === 'EMPLOYEE'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-slate-600 hover:text-slate-900'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <User className="w-4 h-4" />
        Employee
      </motion.button>
    </div>
  );
}
