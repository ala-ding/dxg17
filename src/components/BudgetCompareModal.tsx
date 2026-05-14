import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Layers, Package, ShoppingBag, Target } from 'lucide-react';
import { UserPlan } from '../types';
import { PlanTemplate } from '../data/planTemplates';
import { pricing } from '../utils/pricing';

interface BudgetCompareModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan: UserPlan;
  template: PlanTemplate;
  onApplyTemplate?: () => Promise<void>;
}

export default function BudgetCompareModal({
  open,
  onClose,
  currentPlan,
  template,
  onApplyTemplate
}: BudgetCompareModalProps) {
  const currentItems = (currentPlan.spaces || []).flatMap(s => s.items || []);
  const currentTotal = pricing.calculateProductTotal(currentItems);
  const currentSpaces = Array.from(new Set((currentPlan.spaces || []).map(s => s.name)));
  
  const templateItems = template.items;
  const templateTotal = templateItems.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
  const templateSpaces = Array.from(new Set(templateItems.map(i => i.space)));

  const missingSpaces = templateSpaces.filter(s => !currentSpaces.includes(s));
  
  const coreCategories = ['沙发', '茶几', '电视柜', '餐桌', '餐椅', '床', '床垫', '窗帘', '灯具', '地毯', '挂画', '绿植', '摆件'];
  const currentCategories = Array.from(new Set(currentItems.map(i => (i as any).category).filter(Boolean)));
  const missingCategories = coreCategories.filter(c => !currentCategories.includes(c));

  const [isApplying, setIsApplying] = React.useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      if (onApplyTemplate) await onApplyTemplate();
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#0F0F0F] border border-white/10 rounded-[48px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div>
                <h2 className="text-[28px] font-black text-white flex items-center gap-3">
                   当前方案 vs 推荐完整方案
                </h2>
                <p className="text-white/40 text-[14px]">基于您的预算，匹配最佳参考模板进行深度对比</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left: Current Plan */}
                  <div className="space-y-8">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black">A</div>
                        <h3 className="text-[20px] font-black text-white">我的当前方案 <span className="text-[12px] text-white/20 ml-2 font-medium">({currentPlan.name})</span></h3>
                     </div>
                     
                     <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">商品数量</p>
                              <p className="text-[20px] font-black text-white">{currentItems.length} 件</p>
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">覆盖空间</p>
                              <p className="text-[20px] font-black text-white">{currentSpaces.length} 个</p>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                           <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">商品总额</p>
                           <p className="text-[32px] font-black text-brand">¥{pricing.formatCurrency(currentTotal)}</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        {missingSpaces.length > 0 && (
                          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
                             <h4 className="text-[13px] font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> 缺失空间 ({missingSpaces.length})
                             </h4>
                             <div className="flex flex-wrap gap-3">
                                {missingSpaces.map(s => (
                                  <span key={s} className="px-3 py-1 bg-red-500/10 text-red-500 text-[12px] font-bold rounded-lg">{s}</span>
                                ))}
                             </div>
                          </div>
                        )}

                        <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-3xl">
                           <h4 className="text-[13px] font-black text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Target className="w-4 h-4" /> 缺失品类 ({missingCategories.length})
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {missingCategories.map(c => (
                                <span key={c} className="px-3 py-1 bg-white/5 text-white/40 text-[11px] font-bold rounded-lg">{c}</span>
                              ))}
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                              <p className="text-[12px] font-black text-emerald-400 mb-2">优点</p>
                              <p className="text-[13px] text-white/60 leading-relaxed">预算可控性强，已选择核心大件，符合个人审美偏好。</p>
                           </div>
                           <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                              <p className="text-[12px] font-black text-red-400 mb-2">风险</p>
                              <p className="text-[13px] text-white/60 leading-relaxed">部分空间完全缺失，窗帘/灯具等软装附件不足，空间感由于缺失而减弱。</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right: Recommended Template */}
                  <div className="space-y-8">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center font-black">B</div>
                        <h3 className="text-[20px] font-black text-white">推荐完整方案 <span className="text-[12px] text-white/20 ml-2 font-medium">({template.code} {template.name})</span></h3>
                     </div>

                     <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">推荐商品数</p>
                              <p className="text-[20px] font-black text-white">{templateItems.length} 件</p>
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">覆盖空间</p>
                              <p className="text-[20px] font-black text-white">{templateSpaces.length} 个</p>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                           <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">推荐总额</p>
                           <p className="text-[32px] font-black text-white">¥{pricing.formatCurrency(templateTotal)}</p>
                        </div>
                     </div>

                     <div className="p-8 bg-brand/10 border border-brand/20 rounded-[32px] space-y-6 text-left">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg">
                              <Sparkles className="w-5 h-5" />
                           </div>
                           <h4 className="text-[17px] font-black text-white">AI 对比结论与建议</h4>
                        </div>
                        
                        <div className="space-y-4">
                           <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mt-0.5 shrink-0">1</div>
                              <p className="text-[14px] text-white/80 leading-relaxed">
                                <span className="text-emerald-400 font-bold">当前方案优势：</span>预算分布极具针对性，重点投入在主空间核心家具上，具有很强的灵活性。
                              </p>
                           </div>
                           <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-red-400/20 text-red-400 flex items-center justify-center mt-0.5 shrink-0">2</div>
                              <p className="text-[14px] text-white/80 leading-relaxed">
                                <span className="text-red-400 font-bold">当前方案风险：</span>{missingSpaces.includes('阳台') || missingSpaces.includes('玄关') ? "次要空间完全空白；" : ""}窗帘、灯具、地毯等“氛围件”缺失严重。
                              </p>
                           </div>
                           <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-brand/20 text-brand flex items-center justify-center mt-0.5 shrink-0">3</div>
                              <p className="text-[14px] text-white/80 leading-relaxed">
                                <span className="text-brand font-bold">最终建议：</span>保留您当前已选的个性化大件，点击下方按钮，按推荐方案补齐缺失的空间和软装品类，实现真正的“全屋拎包”。
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-8 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col text-left">
                   <p className="text-[13px] font-bold text-white/40">补齐预计增加</p>
                   <p className="text-[20px] font-black text-brand">+ ¥{pricing.formatCurrency(Math.max(0, templateTotal - currentTotal))}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                   <button 
                     onClick={onClose}
                     className="flex-1 sm:flex-none px-10 py-5 bg-white/5 text-white/40 rounded-3xl font-black text-[15px] hover:bg-white/10 transition-all"
                   >
                     仅查看对比
                   </button>
                   <button 
                     onClick={handleApply}
                     disabled={isApplying}
                     className="flex-1 sm:flex-none px-12 py-5 bg-brand text-white rounded-3xl font-black text-[15px] shadow-xl shadow-brand/20 hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isApplying ? (
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <>按推荐方案补齐 <ArrowRight className="w-4 h-4" /></>
                     )}
                   </button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
