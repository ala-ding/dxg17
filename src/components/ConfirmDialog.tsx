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
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px] pointer-events-none" />
            
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/10 text-red-500' : 'bg-brand/10 text-brand'}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[20px] font-black text-white mb-2">{title}</h3>
                <p className="text-[14px] text-white/40 leading-relaxed font-medium whitespace-pre-line">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onCancel}
                className="flex-1 h-14 bg-white/5 text-white/40 rounded-2xl font-bold text-[15px] hover:bg-white/10 transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 h-14 rounded-2xl font-bold text-[15px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg ${
                  danger 
                    ? 'bg-red-500 text-white shadow-red-500/20' 
                    : 'bg-brand text-white shadow-brand/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
            
            <button 
              onClick={onCancel}
              className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
