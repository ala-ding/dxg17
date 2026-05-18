import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, ShoppingBag, Package, CheckCircle2 } from 'lucide-react';
import { PlanTemplate } from '../data/planTemplates';
import { pricing } from '../utils/pricing';

interface TemplateChecklistModalProps {
  template: PlanTemplate;
  onBack: () => void;
  onClose: () => void;
  onGenerate: () => void;
}

export default function TemplateChecklistModal({
  template,
  onBack,
  onClose,
  onGenerate
}: TemplateChecklistModalProps) {
  const items = template.items || [];
  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.unitPrice ?? 0);
    const quantity = Number(item.quantity ?? 1);
    return sum + price * quantity;
  }, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-end md:items-center justify-center md:p-6 bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 100 }}
          className="bg-[#0F0F0F] border-t md:border border-white/10 rounded-t-[28px] md:rounded-[48px] w-full md:max-w-6xl h-[88vh] md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 md:px-10 py-5 md:py-8 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={onBack}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="overflow-hidden">
                <h2 className="text-[22px] md:text-[26px] font-black text-white truncate">
                   {template.budgetRange}{template.name.split('｜').pop()?.split(' ').pop() || '完整清单'}
                </h2>
                <p className="text-white/40 text-[11px] md:text-[13px] mt-0.5 md:mt-1 flex items-center gap-2">
                   <Package className="w-3.5 h-3.5" /> 共 {items.length} 件 
                   <span className="w-1 h-1 rounded-full bg-white/10" />
                   <span className="text-brand font-bold whitespace-nowrap">预计 ¥{pricing.formatCurrency(totalPrice)}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-4 md:py-6 custom-scrollbar">
            {/* Desktop Table */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-4 px-4 text-[11px] font-black text-white/20 uppercase tracking-widest">产品信息</th>
                  <th className="py-4 px-4 text-[11px] font-black text-white/20 uppercase tracking-widest">空间</th>
                  <th className="py-4 px-4 text-[11px] font-black text-white/20 uppercase tracking-widest text-right">单价</th>
                  <th className="py-4 px-4 text-[11px] font-black text-white/20 uppercase tracking-widest text-center">数量</th>
                  <th className="py-4 px-4 text-[11px] font-black text-white/20 uppercase tracking-widest text-right">小计</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const price = Number(item.unitPrice ?? 0);
                  const quantity = Number(item.quantity ?? 1);
                  const subtotal = price * quantity;

                  return (
                    <tr key={idx} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/5">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/10">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-white group-hover:text-brand transition-colors">{item.name}</p>
                            <p className="text-[11px] text-white/30">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className="px-2.5 py-1 bg-white/5 rounded-lg text-[12px] text-white/60 font-medium">
                          {item.space}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-[14px] font-mono text-white/60 text-right">
                        ¥{pricing.formatCurrency(price)}
                      </td>
                      <td className="py-5 px-4 text-[14px] font-mono text-white/60 text-center">
                        {quantity}
                      </td>
                      <td className="py-5 px-4 text-[14px] font-black text-white text-right">
                        ¥{pricing.formatCurrency(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-3">
              {items.map((item, idx) => {
                const price = Number(item.unitPrice ?? 0);
                const quantity = Number(item.quantity ?? 1);
                const subtotal = price * quantity;

                return (
                  <div key={idx} className="p-4 bg-white/5 rounded-[20px] border border-white/5 flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/5">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-[14px] font-bold text-white truncate">{item.name}</p>
                        <span className="text-[12px] text-white/40 font-mono shrink-0">x{quantity}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-white/30 uppercase tracking-wider">{item.space}</span>
                           <span className="text-[12px] text-white/50 font-mono">¥{pricing.formatCurrency(price)}</span>
                        </div>
                        <span className="text-[14px] font-black text-brand">¥{pricing.formatCurrency(subtotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-10 py-6 md:py-8 border-t border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 shrink-0">
            <div className="hidden md:block">
              <p className="text-[13px] text-white/40">基于当前场景风格与预算档位深度匹配</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
               <button 
                 onClick={onGenerate}
                 className="w-full md:w-auto px-10 h-[50px] md:h-14 bg-brand text-white rounded-xl md:rounded-2xl font-black text-[14px] md:text-[15px] shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> 按这套生成我的方案
               </button>
               <button 
                 onClick={onClose}
                 className="w-full md:w-auto px-10 h-[46px] md:h-14 bg-white/5 text-white/40 rounded-xl md:rounded-2xl font-bold text-[13px] md:text-[14px] hover:bg-white/10 transition-all flex items-center justify-center"
               >
                 关闭
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
