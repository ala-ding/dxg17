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
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 md:p-6 bg-black/95 md:bg-black/90 backdrop-blur-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0A0A0A] md:bg-[#0F0F0F] md:border md:border-white/10 rounded-none md:rounded-[48px] w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 md:px-10 py-6 md:py-8 border-b border-white/5 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-4 md:gap-6 text-left">
              <button 
                onClick={onBack}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div>
                <h2 className="text-[18px] md:text-[24px] font-black text-white truncate max-w-[200px] md:max-w-none">
                   {template.budgetRange}{template.name.split('｜').pop()?.split(' ').pop() || '完整清单'}
                </h2>
                <p className="text-white/30 text-[11px] md:text-[13px] mt-0.5 flex items-center gap-2">
                   <Package className="w-3 h-3" /> {items.length} 件单品 
                   <span className="w-1 h-1 rounded-full bg-white/10" />
                   <span className="text-brand font-bold">总预算约 ¥{pricing.formatCurrency(totalPrice)}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 no-scrollbar">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
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
                              {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10"><ShoppingBag className="w-5 h-5" /></div>}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-white group-hover:text-brand transition-colors">{item.name}</p>
                              <p className="text-[11px] text-white/30">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4"><span className="px-2.5 py-1 bg-white/5 rounded-lg text-[12px] text-white/60 font-medium">{item.space}</span></td>
                        <td className="py-5 px-4 text-[14px] font-mono text-white/60 text-right">¥{pricing.formatCurrency(price)}</td>
                        <td className="py-5 px-4 text-[14px] font-mono text-white/60 text-center">{quantity}</td>
                        <td className="py-5 px-4 text-[14px] font-black text-white text-right">¥{pricing.formatCurrency(subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4 pb-20">
               {items.map((item, idx) => {
                 const price = Number(item.unitPrice ?? 0);
                 const quantity = Number(item.quantity ?? 1);
                 const subtotal = price * quantity;
                 return (
                   <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 rounded-[24px] flex items-center gap-4 text-left">
                      <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/5 shrink-0 overflow-hidden">
                         {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-white/10"><ShoppingBag className="w-5 h-5" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="text-[15px] font-black text-white truncate">{item.name}</h4>
                            <span className="text-[14px] font-black text-brand italic">¥{pricing.formatCurrency(subtotal)}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] text-white/40 uppercase font-bold">{item.category}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[12px] text-white/20 font-medium">¥{pricing.formatCurrency(price)} × {quantity}</span>
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-10 py-6 md:py-8 border-t border-white/5 bg-black/60 flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-[13px] text-white/40 font-medium">基于当前场景风格与预算档位深度匹配</p>
            </div>
            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
               <button 
                 onClick={onClose}
                 className="flex-1 sm:flex-none px-6 md:px-10 py-4 h-12 md:h-14 bg-white/5 text-white/40 rounded-2xl font-bold text-[14px] active:scale-95 transition-all"
               >
                 关闭
               </button>
               <button 
                 onClick={onGenerate}
                 className="flex-2 sm:flex-none px-6 md:px-12 py-4 h-12 md:h-14 bg-brand text-white rounded-[24px] font-black text-[14px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <CheckCircle2 className="w-4 h-4" /> <span className="whitespace-nowrap">生成我的方案</span>
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
