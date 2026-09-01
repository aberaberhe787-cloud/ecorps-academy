import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-4 p-4">
      <div className="bg-slate-900/50 p-4 rounded-full border border-slate-800">
        <Icon className="h-8 w-8 text-slate-600" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-300">{title}</p>
        <p className="text-xs text-slate-400 max-w-[200px]">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
