import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        {theme === 'dark' && <Moon className="h-5 w-5 text-slate-900 dark:text-slate-300" />}
        {theme === 'light' && <Sun className="h-5 w-5 text-slate-900 dark:text-slate-300" />}
        {theme === 'system' && <Laptop className="h-5 w-5 text-slate-900 dark:text-slate-300" />}
      </button>
      
      {isOpen && (
        <div 
          onMouseLeave={() => setIsOpen(false)}
          className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-xl z-50"
        >
          {[
            { label: 'Light', value: 'light', icon: Sun },
            { label: 'Dark', value: 'dark', icon: Moon },
            { label: 'System', value: 'system', icon: Laptop },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => { setTheme(option.value as 'dark' | 'light' | 'system'); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${theme === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
