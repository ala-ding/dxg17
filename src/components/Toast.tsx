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
}

export default function Toast({ message, onClear }: ToastProps) {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
           initial={{ opacity: 0, y: 20, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
           className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] glass-morphism px-8 py-4 rounded-2xl flex items-center gap-3 border-brand/50 shadow-brand/10 shadow-2xl"
        >
          <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center text-white">
            <Info className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-800 whitespace-nowrap">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
