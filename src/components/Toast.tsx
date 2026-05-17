/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClear: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export default function Toast({ message, onClear, action, duration = 3000 }: ToastProps) {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, onClear, duration]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
           initial={{ opacity: 0, y: 20, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
           className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-[#202020]/95 backdrop-blur-xl px-8 py-5 rounded-[24px] flex items-center gap-6 border border-white/10 shadow-2xl min-w-[320px] justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white shadow-lg shadow-brand/20">
              <Info className="w-5 h-5" />
            </div>
            <span className="font-bold text-white/90 text-[15px]">{message}</span>
          </div>
          {action && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                onClear();
              }}
              className="text-brand font-black text-[15px] hover:brightness-125 transition-all px-4 py-2 bg-brand/10 rounded-xl"
            >
              {action.label}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
