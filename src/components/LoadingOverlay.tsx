import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export const LoadingOverlay: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Initializing secure learning space...
        </p>
      </div>
    </motion.div>
  );
};
