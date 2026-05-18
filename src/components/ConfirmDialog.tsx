import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: '20%' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: '20%' }}
            className="relative w-full max-w-md bg-[#1A1A1A] border-t sm:border border-white/10 rounded-t-[24px] sm:rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px] pointer-events-none" />
            
            <div className="flex items-start gap-4 mb-6 relative z-10 text-left">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/10 text-red-500' : 'bg-brand/10 text-brand'}`}>
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[18px] md:text-[20px] font-black text-white mb-2">{title}</h3>
                <p className="text-[13px] md:text-[14px] text-white/40 leading-relaxed font-medium whitespace-pre-line">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10 pb-safe-area">
              <button
                onClick={onCancel}
                className="order-2 sm:order-1 flex-1 h-12 md:h-14 bg-white/5 text-white/40 rounded-xl md:rounded-2xl font-bold text-[14px] md:text-[15px]"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`order-1 sm:order-2 flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-bold text-[14px] md:text-[15px] shadow-lg ${
                  danger 
                    ? 'bg-red-500 text-white shadow-red-500/20' 
                    : 'bg-brand text-white shadow-brand/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
