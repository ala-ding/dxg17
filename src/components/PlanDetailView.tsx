import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ShoppingBag, 
  Palette, 
  Plus, 
  Share2, 
  Trash2, 
  ChevronRight,
  TrendingDown,
  AlertCircle,
  ShieldCheck,
  Target,
  Layers,
  Maximize2,
  Package,
  ArrowRight
} from 'lucide-react';
import { UserPlan, PlanProduct } from '../types';
import { planStorage } from '../utils/planStorage';
import { pricing } from '../utils/pricing';
import { exportPlanCsv } from '../utils/exportCsv';
import PriceSummary from './PriceSummary';
import { useNavigate } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import BudgetCompareModal from './BudgetCompareModal';
import { planService } from '../services/planService';

interface PlanDetailViewProps {
  plan: UserPlan;
  onUpdate: () => void;
  onToast: (msg: string) => void;
  onProductClick: (product: any, tab: string) => void;
  onRename?: () => void;
  onDelete?: () => void;
  onEditRequirements?: () => void;
  initialTab?: string;
}

export default function PlanDetailView({ 
  plan, 
  onUpdate, 
  onToast, 
  onProductClick,
  onRename,
  onDelete,
  onEditRequirements,
  initialTab
}: PlanDetailViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'display' | 'items' | 'budget'>((initialTab as any) || 'display');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  
  const allItems = (plan.spaces?.flatMap(s => s.items || []) || []).filter(Boolean);
  const productTotal = pricing.calculateProductTotal(allItems);

  if (!plan) return null;

  if (allItems.length === 0 && activeTab === 'items') {
    return (
      <div className="w-full py-20 bg-[#1A1A1A] rounded-[48px] border border-white/5 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10">
          <Package className="w-10 h-10" />
        </div>
        <div className="text-center">
          <p className="text-[18px] font-black text-white mb-2">这个方案还没有选品</p>
          <p className="text-[14px] text-white/20 font-bold mb-8">开始添加你喜欢的单品来完善方案吧</p>
          <button 
            onClick={() => navigate('/products?fromPlan=' + plan.id)}
            className="px-10 h-14 bg-brand text-white rounded-full font-black text-[15px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/20"
          >
            去产品库添加产品
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const item = allItems.find(i => i.id === productId);
    if (!item) return;
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    planStorage.updateItemQuantity(plan.id, productId, newQty);
    onUpdate();
  };

  const handleRemoveItem = (productId: string) => {
    if (confirm('确定要从方案中移除该产品吗？')) {
      planStorage.removeProductFromPlan(plan.id, productId);
      onUpdate();
      onToast('已成功移除产品');
    }
  };

  const getAiAdvice = () => {
    const grandTotal = pricing.calculateGrandTotal(productTotal);
    const budgetLimit = plan.budget?.range?.includes('万') 
      ? parseInt(plan.budget.range.split('-')[1]) * 10000 
      : 150000;

    if (productTotal === 0) return '你还没有加入产品，建议先从沙发、床垫、餐桌椅这些高频大件开始。';
    if (grandTotal < budgetLimit * 0.7) return '当前预算还有空间，可以考虑升级主沙发、床垫和灯光系统。';
    if (grandTotal <= budgetLimit) return '当前预算使用比较健康，建议重点检查风格统一度和空间完整度。';
    return '当前方案已超出预算，建议优先压缩装饰品、地毯、边几等非核心项目。';
  };

  const isConfirmed = plan.status === 'completed' || (plan.status as string) === 'confirmed';

  return (
    <div className="w-full space-y-10">
      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'display', label: '方案展示' },
          { id: 'items', label: '选品清单' },
          { id: 'budget', label: '预算与建议' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-4 text-[16px] font-black transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-brand' : 'text-white/40 hover:text-white pb-5'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === 'display' && (
          <div className="space-y-10">
            {/* Main Collage/Moodboard Placeholder */}
            <div className="relative aspect-[16/9] bg-[#1A1A1A] rounded-[48px] overflow-hidden shadow-2xl border border-white/5 group">
              <img 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000" 
                className="w-full h-full object-cover opacity-80"
                alt="AI Space Simulation"
              />
              
              {/* Product Hotspots Overlay */}
              <div className="absolute inset-0 z-10 p-12">
                 {allItems.slice(0, 2).map((p, i) => (
                   <div 
                     key={p.id} 
                     className="absolute group/dot"
                     style={{ top: i === 0 ? '45%' : '35%', left: i === 0 ? '30%' : 'auto', right: i === 1 ? '25%' : 'auto' }}
                   >
                     <div className="w-8 h-8 rounded-full bg-brand/80 backdrop-blur-md border border-white/50 flex items-center justify-center animate-pulse cursor-pointer">
                       <ShoppingBag className="w-4 h-4 text-white" />
                     </div>
                     <div className="absolute top-10 left-0 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 opacity-0 group-hover/dot:opacity-100 transition-opacity whitespace-nowrap z-20">
                        <p className="text-[14px] font-black text-white">{p.name}</p>
                        <p className="text-[12px] text-brand font-bold">¥{pricing.formatCurrency(p.price)}</p>
                     </div>
                   </div>
                 ))}
              </div>

              {/* Info Overlay */}
              <div className="absolute top-12 left-12 z-20">
                  <div className="bg-black/60 backdrop-blur-2xl px-6 py-4 rounded-[28px] border border-white/10 text-left flex items-center justify-between min-w-[320px]">
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <Sparkles className="w-5 h-5 text-brand" />
                           <span className="text-[13px] font-black text-white/40 uppercase tracking-widest">AI Space Simulation</span>
                        </div>
                        <h3 className="text-[24px] font-bold text-white italic font-serif">{plan.name || '未命名方案'}</h3>
                     </div>
                     <div className="flex items-center gap-2 ml-8 pl-8 border-l border-white/10">
                        <button 
                          onClick={() => onRename?.()}
                          className="p-3 bg-white/5 hover:bg-brand/20 text-white/40 hover:text-brand rounded-2xl transition-all"
                          title="修改名称"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onDelete?.()}
                          className="p-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-2xl transition-all"
                          title="删除方案"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
              </div>

              <div className="absolute bottom-12 left-12 z-20 flex flex-col items-start text-left">
                  <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-[14px] font-black text-white">方案匹配度</p>
                      <p className="text-[12px] text-white/40 font-bold">已关联 {allItems.length} 件配套单品</p>
                    </div>
                  </div>
                  <h2 className="text-[36px] font-black text-white leading-tight drop-shadow-2xl">
                    追求通透感与金属质感的平衡
                  </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-[#1A1A1A] border border-white/5 rounded-[40px] p-10 h-[400px] flex flex-col text-left">
                  <h4 className="text-[12px] font-black text-white/20 uppercase tracking-widest mb-8">搭配色盘 / Color Palette</h4>
                  <div className="flex-1 flex flex-col justify-center gap-6">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-[#5D5C43] shadow-[0_0_30px_rgba(93,92,67,0.3)] border-2 border-white/10"></div>
                        <div className="text-left">
                          <p className="font-black text-white text-[16px]">苔藓绿</p>
                          <p className="text-white/30 text-[11px] font-mono tracking-widest">#5D5C43</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-[#D7C4A5] shadow-[0_0_30px_rgba(215,196,165,0.3)] border-2 border-white/10"></div>
                        <div className="text-left">
                          <p className="font-black text-white text-[16px]">暖沙色</p>
                          <p className="text-white/30 text-[11px] font-mono tracking-widest">#D7C4A5</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="md:col-span-2 bg-[#1A1A1A] border border-white/5 rounded-[40px] p-10 h-[400px] flex flex-col text-left">
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-[12px] font-black text-white/20 uppercase tracking-widest">清单内容关联 / Items Linked</h4>
                     <button 
                       onClick={() => navigate('/products?fromPlan=' + plan.id)}
                       className="text-[12px] font-bold text-brand hover:underline"
                     >
                       + 添加产品
                     </button>
                  </div>
                  <div className="flex flex-wrap gap-6 justify-start flex-1 items-center overflow-y-auto custom-scrollbar pr-4">
                     {allItems.map((p, i) => (
                       <div 
                         key={i} 
                         onClick={() => onProductClick(p, activeTab)}
                         className="w-32 h-32 bg-white/5 border border-white/10 rounded-[32px] p-4 shadow-xl hover:bg-white/[0.08] transition-all hover:-translate-y-2 cursor-pointer group/item flex items-center justify-center relative shrink-0"
                       >
                          <img src={p.image} className="w-full h-full object-contain filter group-hover/item:brightness-110" alt={p.name} />
                          <div className="absolute top-2 right-2 w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white scale-0 group-hover/item:scale-100 transition-transform shadow-lg z-10">
                             <ShoppingBag className="w-4 h-4" />
                          </div>
                       </div>
                     ))}
                     <button 
                       onClick={() => navigate('/products?fromPlan=' + plan.id)}
                       className="w-32 h-32 bg-brand/5 border-2 border-dashed border-brand/20 rounded-[32px] flex items-center justify-center text-brand cursor-pointer hover:bg-brand/10 transition-colors group shrink-0"
                     >
                        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-[#1A1A1A] border border-white/10 p-6 rounded-[32px]">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-brand rounded-full"></span>
                      <span className="text-[14px] font-black text-white">方案状态：{isConfirmed ? '正式清单' : '草稿方案'}</span>
                   </div>
                   <div className="h-6 w-px bg-white/10"></div>
                   <span className="text-[14px] font-medium text-white/40">已添加 {allItems.length} 件单品</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate('/products?fromPlan=' + plan.id)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-black text-[14px] hover:bg-white/10 transition-all"
                  >
                    + 继续选品
                  </button>
                  <button 
                    onClick={() => exportPlanCsv(plan)}
                    className="px-8 py-3 bg-white text-black rounded-full font-black text-[14px] hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> 导出 CSV 清单
                  </button>
                </div>
            </div>

            <div className="bg-[#1A1A1A] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-[14px] border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-black/40 border-b border-white/10 text-white/30 font-black">
                          <th className="px-6 py-6 text-left">产品信息</th>
                          <th className="px-6 py-6 text-left">空间</th>
                          <th className="px-6 py-6 text-right">单价</th>
                          <th className="px-6 py-6 text-center">数量</th>
                          <th className="px-6 py-6 text-right">小计</th>
                          <th className="px-6 py-6 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(plan.spaces || []).map(space => (
                          <React.Fragment key={space.id}>
                            {(space.items || []).map(item => (
                              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-6">
                                  <div 
                                    className="flex items-center gap-4 cursor-pointer group/item-info"
                                    onClick={() => onProductClick(item, activeTab)}
                                  >
                                     <div className="w-16 h-16 bg-white rounded-xl p-2 shrink-0 border border-white/10 overflow-hidden">
                                        <img src={item.image} className="w-full h-full object-contain group-hover/item-info:scale-110 transition-transform" alt="" />
                                     </div>
                                     <div className="text-left">
                                        <p className="font-black text-white group-hover/item-info:text-brand transition-colors">{item.name}</p>
                                        <p className="text-[12px] text-white/20 font-bold mt-0.5">{(item as any).brand || 'DXG'}</p>
                                     </div>
                                  </div>
                                </td>
                                <td className="px-6 py-6 text-left">
                                   <span className="px-4 py-1.5 bg-white/5 rounded-full text-[12px] font-black text-white/40">{space.name}</span>
                                </td>
                                <td className="px-6 py-6 text-right font-mono font-bold text-white/60">
                                   ¥{pricing.formatCurrency(item.price || 0)}
                                </td>
                                <td className="px-6 py-6">
                                   <div className="flex items-center justify-center gap-3">
                                      <button 
                                        onClick={() => handleUpdateQuantity(item.id, -1)}
                                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white"
                                      >
                                         -
                                      </button>
                                      <span className="w-8 text-center font-black text-white">{item.quantity || 1}</span>
                                      <button 
                                        onClick={() => handleUpdateQuantity(item.id, 1)}
                                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white"
                                      >
                                         +
                                      </button>
                                   </div>
                                </td>
                                <td className="px-6 py-6 text-right font-black text-white">
                                   ¥{pricing.formatCurrency((item.price || 0) * (item.quantity || 1))}
                                </td>
                                <td className="px-6 py-6">
                                   <div className="flex items-center justify-center gap-2">
                                      <button 
                                        onClick={() => onProductClick(item, activeTab)}
                                        className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-brand/10 hover:text-brand transition-all"
                                        title="查看详情"
                                      >
                                         <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                        title="移除"
                                      >
                                         <Trash2 className="w-4 h-4" />
                                      </button>
                                   </div>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                </div>

                <div className="p-10 bg-white/[0.02] border-t border-white/5 flex justify-end">
                   <div className="w-full max-w-xs">
                      <PriceSummary productTotal={productTotal} />
                      <button 
                        onClick={() => {
                          if (productTotal === 0) {
                            onToast('请先添加产品至方案');
                            return;
                          }
                          // In a real app, we'd update the status via service first
                          navigate(`/checkout/${plan.id}`);
                        }}
                        className={`w-full py-5 mt-8 rounded-[32px] font-black text-[16px] shadow-xl transition-all ${isConfirmed ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-brand text-white hover:scale-[1.02]'}`}
                        disabled={isConfirmed}
                      >
                        {isConfirmed ? '方案已完成' : '确认方案，下一步付款'}
                      </button>
                   </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
             <div className="lg:col-span-8 space-y-8">
                <div className="bg-[#1A1A1A] border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group/card">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] pointer-events-none" />
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                      <Target className="w-6 h-6 text-brand" /> 方案核心指标
                    </h3>
                    <button 
                      onClick={onEditRequirements}
                      className="text-[13px] font-black text-brand hover:underline flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" /> 编辑需求
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                     {[
                       { label: '预计面积', value: plan.areaRange || plan.matchProfile?.areaRange || '待完善', icon: <Maximize2 className="w-5 h-5 text-brand" /> },
                       { label: '预算上限', value: plan.budgetLimit || plan.budget?.range || '待完善', icon: <ShieldCheck className="w-5 h-5 text-brand" /> },
                       { label: '已配空间', value: (plan.spaces && plan.spaces.length > 0) ? plan.spaces.map(s => typeof s === 'string' ? s : s.name).join(' / ') : '待选择', icon: <Layers className="w-5 h-5 text-brand" /> },
                       { label: '心仪风格', value: plan.preferredStyle || plan.style || plan.matchProfile?.styleFeelings?.[0] || '默认极简', icon: <Palette className="w-5 h-5 text-brand" /> }
                     ].map((item, idx) => (
                       <div key={idx} className="space-y-4">
                         <p className="text-[11px] font-black text-white/20 uppercase tracking-widest leading-none">{item.label}</p>
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand">
                             {item.icon}
                           </div>
                           <p className="text-[18px] font-black text-white">{item.value}</p>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="bg-[#1A1A1A] border border-white/5 rounded-[48px] p-12 shadow-2xl">
                  <div className="flex items-center gap-4 mb-12">
                      <div className="w-16 h-16 rounded-[24px] bg-brand text-white flex items-center justify-center shadow-2xl shadow-brand/20">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-[28px] font-black text-white">AI 方案综合建议</h3>
                        <p className="text-white/40 text-[15px] font-medium font-mono uppercase tracking-widest">Diagnostics Report v2.4</p>
                      </div>
                  </div>
                  <div className="p-8 bg-brand/5 border border-brand/20 rounded-[32px] mb-12">
                     <p className="text-[18px] font-black text-white leading-relaxed italic">
                        “{getAiAdvice()}”
                     </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <h4 className="text-[13px] font-black text-brand uppercase tracking-widest">建议保留的核心件</h4>
                        <ul className="space-y-4">
                          {['主沙发', '主卧床垫', '全屋窗帘'].map((l, i) => (
                            <li key={i} className="flex items-center gap-3 text-[15px] text-white/80 font-medium bg-white/5 p-4 rounded-2xl border border-white/5">
                              <ShieldCheck className="w-5 h-5 text-emerald-500" /> {l}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-8">
                        <h4 className="text-[13px] font-black text-orange-400 uppercase tracking-widest">建议按需升级或延后的装饰</h4>
                        <ul className="space-y-4">
                          {['客厅地毯', '玄关挂画', '边几/落地灯'].map((l, i) => (
                            <li key={i} className="flex items-center gap-3 text-[15px] text-white/80 font-medium bg-white/5 p-4 rounded-2xl border border-white/5">
                              <Package className="w-5 h-5 text-orange-400" /> {l}
                            </li>
                          ))}
                        </ul>
                      </div>
                  </div>
                </div>
             </div>

             <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#1A1A1A] border border-white/10 rounded-[40px] p-10 flex flex-col items-center text-center">
                   <div className="shrink-0 relative mb-8">
                      <div className="w-40 h-40 rounded-full border-[10px] border-white/5 flex flex-col items-center justify-center relative">
                         <span className="text-[48px] font-black text-brand leading-none">{plan.completion || 0}</span>
                         <div className="flex flex-col items-center mt-2">
                           <span className="text-[14px] font-black text-white/80">资料完整度</span>
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-0.5">Completeness</span>
                         </div>
                         {/* Optional progress ring path can be added here if needed */}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[15px] text-white/60 leading-relaxed font-bold px-4">
                        {plan.completion < 50 ? (
                          '基础资料已保存，补充户型、预算和空间后，AI 推荐会更准确。'
                        ) : plan.completion < 85 ? (
                          '资料已基本完整，继续补充需求和重点关注可提升推荐准确度。'
                        ) : (
                          '资料较完整，AI 将为您进行更精准的家具匹配。'
                        )}
                      </p>
                   </div>
                </div>

                <div className="bg-brand rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px] pointer-events-none" />
                   <h4 className="text-[20px] font-black mb-8">预算健康度分析</h4>
                   <div className="space-y-8">
                      <div className="p-5 bg-white/10 rounded-3xl border border-white/10">
                         <div className="flex justify-between items-center text-[13px] font-black mb-3">
                            <span className="opacity-60">预估总价</span>
                            <span>¥{pricing.formatCurrency(pricing.calculateGrandTotal(productTotal))}</span>
                         </div>
                         <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '85%' }}
                              className="h-full bg-white" 
                            />
                         </div>
                         <p className="text-[11px] font-bold mt-3 opacity-40">对比该档位平均值节约约 12%</p>
                      </div>
                      
                      <button 
                        onClick={() => setIsCompareOpen(true)}
                        className="w-full py-5 bg-white text-black rounded-3xl font-black text-[15px] flex items-center justify-center gap-2 group-hover:bg-opacity-90 transition-all"
                      >
                        对比预算天梯 <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <BudgetCompareModal
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentPlan={plan}
        template={
          planService.getPlanTemplateById(
            (plan.budgetLimit || plan.budget?.range)?.includes('15') ? 'S1' : 
            (plan.budgetLimit || plan.budget?.range)?.includes('35') ? 'X2' : 
            (plan.budgetLimit || plan.budget?.range)?.includes('8') ? 'M2' : 'P1'
          ) || planService.getPlanTemplates()[0]
        }
        onApplyTemplate={async () => {
          const budget = plan.budgetLimit || plan.budget?.range || '';
          const templateCode = budget.includes('15') ? 'S1' : 
                              budget.includes('35') ? 'X2' : 
                              budget.includes('8') ? 'M2' : 'P1';
          const template = planService.getPlanTemplateById(templateCode);
          if (template) {
            await planService.addTemplateMissingItemsToPlan(plan.id, template.id);
            onUpdate();
            onToast('已根据推荐方案补齐缺失项');
          }
        }}
      />
    </div>
  );
}
