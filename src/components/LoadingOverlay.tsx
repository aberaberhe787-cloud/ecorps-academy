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
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4 px-4">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-400 text-center">
          Initializing secure learning space...
        </p>
      </div>
    </motion.div>
  );
};
