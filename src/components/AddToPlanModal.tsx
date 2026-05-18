import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, ShoppingBag, Check, ChevronRight, Layout, LayoutGrid } from 'lucide-react';
import { planStorage } from '../utils/planStorage';
import { planService } from '../services/planService';
import { pricing } from '../utils/pricing';
import { UserPlan } from '../types';

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSuccess?: (planId: string) => void;
  onToast?: (msg: string) => void;
  onAdded?: (planName: string) => void;
  prioritizedPlanId?: string;
}

export default function AddToPlanModal({ isOpen, onClose, product, onSuccess, onToast, onAdded, prioritizedPlanId }: AddToPlanModalProps) {
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [view, setView] = useState<'selection' | 'create'>('selection');
  const [newPlanName, setNewPlanName] = useState('我的全屋方案');
  const [isAdding, setIsAdding] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allPlans = planStorage.getPlans();
      if (prioritizedPlanId) {
        const prioritized = allPlans.find(p => p.id === prioritizedPlanId);
        const others = allPlans.filter(p => p.id !== prioritizedPlanId);
        setPlans(prioritized ? [prioritized, ...others] : allPlans);
      } else {
        setPlans(allPlans);
      }
    }
  }, [isOpen, prioritizedPlanId]);

  const handleAddToExisting = async (planId: string) => {
    if (isAdding) return;
    setIsAdding(planId);
    try {
      const plan = plans.find(p => p.id === planId);
      const allItemsBefore = (plan?.spaces || []).flatMap(s => s.items || []).filter(Boolean);
      const existingItem = allItemsBefore.find(i => (i.product_id || i.id) === (product.productId || product.id));
      await planService.addProductToPlan(planId, product);
      const newQty = (existingItem?.quantity || 0) + 1;
      const message = existingItem ? `数量 +1，当前共 ${newQty} 件` : `已加入方案：“${plan?.name || '我的方案'}”`;
      onToast?.(message);
      onAdded?.(plan?.name || '我的方案');
      onSuccess?.(planId);
      onClose();
    } catch (e: any) { onToast?.(`添加失败: ${e.message}`); } finally { setIsAdding(null); }
  };

  const handleCreateAndAdd = async () => {
    if (!newPlanName.trim() || isAdding) return;
    setIsAdding('new');
    try {
      const newPlan = planStorage.createPlan({ name: newPlanName });
      await planService.addProductToPlan(newPlan.id, product);
      onToast?.(`已新建方案并加入：“${newPlan.name}”`);
      onAdded?.(newPlan.name);
      onSuccess?.(newPlan.id);
      onClose();
    } catch (e: any) { onToast?.(`创建失败: ${e.message}`); } finally { setIsAdding(null); }
  };

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          className="relative w-full max-w-lg bg-[#141414] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        >
          <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center"><Plus className="w-6 h-6" /></div>
                <h3 className="text-[18px] md:text-[20px] font-black text-white">加入方案清单</h3>
             </div>
             <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-white/40 flex items-center justify-center"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 no-scrollbar">
             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl p-2 shrink-0"><img src={product.image} className="w-full h-full object-contain" alt="" /></div>
                <div className="flex-1 text-left">
                   <p className="text-[14px] md:text-[15px] font-black text-white line-clamp-1">{product.name}</p>
                   <p className="text-[12px] md:text-[13px] text-brand font-bold mt-1">¥{pricing.formatCurrency(product.price)}</p>
                </div>
             </div>

             {view === 'selection' ? (
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                     <h4 className="text-[12px] font-black text-white/30 tracking-widest uppercase">选择已有方案</h4>
                     <button onClick={() => setView('create')} className="text-[12px] font-bold text-brand hover:underline">+ 新建方案</button>
                  </div>
                  <div className="space-y-3 pb-4">
                     {plans.length > 0 ? (
                       plans.map(plan => {
                        const allItems = (plan.spaces || []).flatMap(s => s.items || []).filter(Boolean);
                        return (
                           <button 
                             key={plan.id} onClick={() => handleAddToExisting(plan.id)} disabled={!!isAdding}
                             className={`w-full bg-[#1A1A1A] border p-4 rounded-2xl flex items-center justify-between group ${isAdding === plan.id ? 'opacity-50' : ''} ${plan.id === prioritizedPlanId ? 'border-brand/40 bg-brand/5' : 'border-white/5'}`}
                           >
                              <div className="flex items-center gap-3 text-left">
                                 <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${plan.id === prioritizedPlanId ? 'bg-brand text-white' : 'bg-white/5 text-white/20'}`}>
                                    {isAdding === plan.id ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-brand" /> : <Layout className="w-4 h-4" />}
                                 </div>
                                 <div className="min-w-0">
                                    <p className={`text-[14px] font-black truncate ${plan.id === prioritizedPlanId ? 'text-brand' : 'text-white'}`}>{plan.name}</p>
                                    <p className="text-[11px] text-white/20 font-bold">{allItems.length} 件单品</p>
                                 </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-white/10" />
                           </button>
                        );
                       })
                     ) : (
                       <div className="py-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                          <p className="text-white/20 text-[13px] mb-4">暂无方案</p>
                          <button onClick={() => setView('create')} className="px-6 py-2 bg-brand text-white rounded-full text-[12px] font-black">新建一个</button>
                       </div>
                     )}
                  </div>
               </div>
             ) : (
               <div className="space-y-6 pb-6">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('selection')}><ChevronRight className="w-4 h-4 rotate-180 text-white/20" /><span className="text-[12px] font-black text-white/30 uppercase">返回选择</span></div>
                  <div className="space-y-2 text-left">
                     <label className="text-[12px] font-black text-white/20 ml-1">方案名称</label>
                     <input type="text" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-white font-bold" />
                  </div>
                  <button onClick={handleCreateAndAdd} disabled={!!isAdding} className="w-full h-14 bg-brand text-white rounded-2xl font-black text-[15px] shadow-lg shadow-brand/20">创建并加入</button>
               </div>
             )}
          </div>
          <div className="p-4 bg-white/5 border-t border-white/5 pb-safe-area"><p className="text-[11px] text-white/20 font-bold text-center">数据将分发到工厂端进行匹配核算</p></div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
