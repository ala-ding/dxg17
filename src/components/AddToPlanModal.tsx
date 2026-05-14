import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, ShoppingBag, Check, ChevronRight, Layout, LayoutGrid } from 'lucide-react';
import { planStorage } from '../utils/planStorage';
import { pricing } from '../utils/pricing';
import { UserPlan } from '../types';

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSuccess?: (planId: string) => void;
  onToast?: (msg: string) => void;
  onAdded?: (planName: string) => void;
}

export default function AddToPlanModal({ isOpen, onClose, product, onSuccess, onToast, onAdded }: AddToPlanModalProps) {
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [view, setView] = useState<'selection' | 'create'>('selection');
  const [newPlanName, setNewPlanName] = useState('我的全屋方案');

  useEffect(() => {
    if (isOpen) {
      setPlans(planStorage.getPlans());
    }
  }, [isOpen]);

  const handleAddToExisting = (planId: string) => {
    planStorage.addProductToPlan(planId, product);
    const plan = plans.find(p => p.id === planId);
    onToast?.(`已加入方案：“${plan?.name || '我的方案'}”`);
    onAdded?.(plan?.name || '我的方案');
    onSuccess?.(planId);
    onClose();
  };

  const handleCreateAndAdd = () => {
    if (!newPlanName.trim()) return;
    const newPlan = planStorage.createPlan({ name: newPlanName });
    planStorage.addProductToPlan(newPlan.id, product);
    onToast?.(`已新建方案并加入：“${newPlan.name}”`);
    onAdded?.(newPlan.name);
    onSuccess?.(newPlan.id);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                 <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-[20px] font-black text-white">加入方案清单</h3>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
           {/* Product Summary */}
           <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-20 h-20 bg-white rounded-xl p-2 shrink-0">
                 <img src={product.image} className="w-full h-full object-contain" alt="" />
              </div>
              <div className="flex-1 text-left">
                 <p className="text-[15px] font-black text-white line-clamp-1">{product.name}</p>
                 <p className="text-[13px] text-brand font-bold mt-1">¥{pricing.formatCurrency(product.price)}</p>
              </div>
           </div>

           {view === 'selection' ? (
             <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <h4 className="text-[13px] font-black text-white/40 uppercase tracking-widest">选择已有方案</h4>
                   <button 
                     onClick={() => setView('create')}
                     className="text-[12px] font-bold text-brand hover:underline"
                   >
                     + 新建方案
                   </button>
                </div>

                <div className="space-y-3">
                   {plans.length > 0 ? (
                     plans.map(plan => {
                      const allItems = (plan.spaces || []).flatMap(s => s.items || []).filter(Boolean);
                      const itemCount = allItems.length;
                      const totalPrice = pricing.calculateProductTotal(allItems);

                      return (
                         <button 
                           key={plan.id}
                           onClick={() => handleAddToExisting(plan.id)}
                           className="w-full bg-[#1A1A1A] hover:bg-white/5 border border-white/5 p-4 py-5 rounded-2xl transition-all flex items-center justify-between group"
                         >
                            <div className="flex items-center gap-4 text-left">
                               <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand transition-colors">
                                  <Layout className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-[15px] font-black text-white group-hover:text-brand transition-colors">{plan.name}</p>
                                  <p className="text-[12px] text-white/20 font-bold mt-0.5">
                                    {itemCount} 件单品 · ¥{pricing.formatCurrency(totalPrice)}
                                  </p>
                               </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white transition-colors" />
                         </button>
                       );
                     })
                   ) : (
                     <div className="py-12 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                        <LayoutGrid className="w-12 h-12 text-white/10 mb-4" />
                        <p className="text-white/40 text-[14px] font-medium mb-6">你还没有创建方案</p>
                        <button 
                          onClick={() => setView('create')}
                          className="px-6 py-2.5 bg-brand text-white rounded-full text-[13px] font-black shadow-lg"
                        >
                          立即创建一个
                        </button>
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setView('selection')}
                     className="text-white/40 hover:text-white transition-colors"
                   >
                     <ChevronRight className="w-5 h-5 rotate-180" />
                   </button>
                   <h4 className="text-[13px] font-black text-white/40 uppercase tracking-widest">新建方案</h4>
                </div>

                <div className="space-y-2">
                   <label className="text-[12px] font-black text-white/20 ml-1">方案名称</label>
                   <input 
                     type="text"
                     value={newPlanName}
                     onChange={(e) => setNewPlanName(e.target.value)}
                     placeholder="输入方案名称，如：现代简约三居室"
                     className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand transition-all font-bold"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 opacity-40">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">风格 (可选)</p>
                      <p className="text-[14px] font-bold text-white">暂未设置</p>
                   </div>
                   <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 opacity-40">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">预算 (可选)</p>
                      <p className="text-[14px] font-bold text-white">暂未设置</p>
                   </div>
                </div>

                <button 
                  onClick={handleCreateAndAdd}
                  className="w-full py-5 bg-white text-black rounded-3xl font-black text-[16px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  创建并加入方案
                </button>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5">
           <p className="text-[12px] text-white/20 font-bold text-center">
              所有数据将保存至本地，不会同步至云端。
           </p>
        </div>
      </motion.div>
    </div>
  );
}
