import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ArrowRight,
  CheckCircle2,
  Truck,
  Settings,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { UserPlan, PlanProduct } from '../types';
import { planStorage } from '../utils/planStorage';
import { pricing } from '../utils/pricing';
import { calculateOrderPricing } from '../utils/orderPricing';
import { exportPlanCsv } from '../utils/exportCsv';
import PriceSummary from './PriceSummary';
import { useNavigate } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import BudgetCompareModal from './BudgetCompareModal';
import { planService } from '../services/planService';
import { membershipService } from '../services/membershipService';
import { UserMembership, ServiceMode, PlanItem } from '../types/business';

interface PlanDetailViewProps {
  plan: UserPlan;
  onUpdate: () => void;
  onToast: (msg: string, action?: { label: string; onClick: () => void }) => void;
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
  const [activeTab, setActiveTab] = useState<'display' | 'items' | 'delivery' | 'budget'>((initialTab as any) || 'display');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [lastRemovedItem, setLastRemovedItem] = useState<{ item: any; spaceId: string } | null>(null);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  
  // Service Selections (Moved from Checkout to Plan Detail for better flow)
  const [serviceMode, setServiceMode] = useState<ServiceMode>('platform_standard');
  const [logisticsLevel, setLogisticsLevel] = useState<'none' | 'economic' | 'standard' | '安心' | 'brand'>('standard');
  const [afterSalesLevel, setAfterSalesLevel] = useState<'none' | 'basic' | '安心' | '尊享'>('basic');
  const [installationLevel, setInstallationLevel] = useState<'none' | 'standard' | 'complex'>('standard');
  const [designLevel, setDesignLevel] = useState<'none' | 'consulting' | 'single' | 'full'>('none');
  
  useEffect(() => {
    membershipService.getCurrentUserMembership().then(m => {
      setMembership(m);
      if (m?.member_type === 'professional' || m?.member_type === 'agent') {
        setServiceMode('self_service');
        setAfterSalesLevel('none');
      }
    });
  }, []);

  const isProfessional = membership?.member_type === 'professional' || membership?.member_type === 'agent';

  useEffect(() => {
    if (plan.id) {
      planService.cleanupDuplicateItems(plan.id).then(() => {
        onUpdate();
      });
    }
  }, [plan.id]);

  const allItems = (plan.spaces?.flatMap(s => s.items || []) || []).filter(Boolean);
  const totalQuantity = allItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const uniqueProductsCount = allItems.length;
  
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

  const handleRemoveItem = async (productId: string, spaceId: string) => {
    const space = plan.spaces?.find(s => s.id === spaceId);
    const item = space?.items?.find(i => i.id === productId);
    if (!item) return;

    // Direct removal for better UX
    setLastRemovedItem({ item, spaceId });
    
    try {
      await planService.removeProductFromPlan(plan.id, productId);
      onUpdate();
      
      onToast(`已从方案清单移除「${item.name}」`, {
        label: '撤销',
        onClick: async () => {
          if (item) {
            await planService.addProductToPlan(plan.id, item, item.quantity || 1, spaceId);
            onUpdate();
          }
        }
      });
    } catch (e: any) {
      onToast(`移除失败: ${e.message}`);
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
          { id: 'delivery', label: '服务与交付' },
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

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setActiveTab('delivery')}
                className="px-12 py-5 bg-brand text-white rounded-full font-black text-[16px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                下一步：配置服务与交付 <ArrowRight className="w-5 h-5" />
              </button>
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
                       onClick={() => navigate(`/products?fromPlan=${plan.id}&fromPlanName=${encodeURIComponent(plan.name)}`)}
                       className="text-[12px] font-bold text-brand hover:underline"
                     >
                       + 添加产品
                     </button>
                  </div>
                  <div className="flex flex-wrap gap-6 justify-start flex-1 items-center overflow-y-auto custom-scrollbar pr-4">
                     {allItems.map((p, i) => (
                       <div 
                         key={`${p.id}-${i}`} 
                         onClick={() => onProductClick(p, activeTab)}
                         className="w-32 h-32 bg-white/5 border border-white/10 rounded-[32px] p-4 shadow-xl hover:bg-white/[0.08] transition-all hover:-translate-y-2 cursor-pointer group/item flex items-center justify-center relative shrink-0"
                       >
                          <img src={p.image || null} className="w-full h-full object-contain filter group-hover/item:brightness-110" alt={p.name} />
                          {p.quantity > 1 && (
                            <div className="absolute -top-2 -right-2 px-3 py-1 bg-brand text-white text-[12px] font-black rounded-full shadow-lg z-20 border-2 border-[#1A1A1A]">
                               ×{p.quantity}
                            </div>
                          )}
                          <div className="absolute top-2 right-2 w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white scale-0 group-hover/item:scale-100 transition-transform shadow-lg z-10">
                             <ShoppingBag className="w-4 h-4" />
                          </div>
                       </div>
                     ))}
                     <button 
                       onClick={() => navigate(`/products?fromPlan=${plan.id}&fromPlanName=${encodeURIComponent(plan.name)}`)}
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
                    <span className="text-[14px] font-medium text-white/40">已选 {uniqueProductsCount} 款产品，共 {totalQuantity} 件</span>
                 </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate(`/products?fromPlan=${plan.id}&fromPlanName=${encodeURIComponent(plan.name)}`)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-black text-[14px] hover:bg-white/10 transition-all"
                  >
                    + 继续选品
                  </button>
                  <button 
                    onClick={() => exportPlanCsv(plan, { 
                      membership, 
                      serviceMode, 
                      logisticsLevel, 
                      afterSalesLevel, 
                      installationLevel, 
                      designLevel 
                    })}
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
                        <AnimatePresence initial={false}>
                          {(plan.spaces || []).map(space => (
                            <React.Fragment key={space.id}>
                              {(space.items || []).map(item => (
                                <motion.tr 
                                  layout
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, x: -20, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  key={item.id} 
                                  className="hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0"
                                >
                                  <td className="px-6 py-6">
                                    <div 
                                      className="flex items-center gap-4 cursor-pointer group/item-info"
                                      onClick={() => onProductClick(item, activeTab)}
                                    >
                                       <div className="w-16 h-16 bg-white rounded-xl p-2 shrink-0 border border-white/10 overflow-hidden">
                                          <img src={item.image || null} className="w-full h-full object-contain group-hover/item-info:scale-110 transition-transform" alt="" />
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
                                     <div className="flex flex-col items-end">
                                        <span>¥{pricing.formatCurrency(isProfessional ? (item.product_snapshot?.factory_price || item.price) : (item.product_snapshot?.standard_service_price || Math.round((item.price || 0) * 1.2)))}</span>
                                        <span className="text-[9px] text-white/20 uppercase tracking-widest">{isProfessional ? '出厂结算价' : '含平台中心服务费'}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-6">
                                     <div className="flex items-center justify-center gap-3">
                                         <button 
                                           onClick={() => handleUpdateQuantity(item.id, -1)}
                                           className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center transition-colors ${item.quantity <= 1 ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
                                           disabled={item.quantity <= 1}
                                         >
                                            -
                                         </button>
                                         <span className="w-8 text-center font-black text-white">{item.quantity || 1}</span>
                                         <button 
                                           onClick={() => handleUpdateQuantity(item.id, 1)}
                                           className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                                         >
                                            +
                                         </button>
                                     </div>
                                  </td>
                                  <td className="px-6 py-6 text-right font-black text-white">
                                     ¥{pricing.formatCurrency((isProfessional ? (item.product_snapshot?.factory_price || item.price || 0) : (item.product_snapshot?.standard_service_price || Math.round((item.price || 0) * 1.2))) * (item.quantity || 1))}
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
                                          onClick={() => handleRemoveItem(item.id, space.id)}
                                          className="p-2.5 rounded-xl bg-white/5 text-white/36 hover:bg-red-500/10 hover:text-red-500 active:scale-95 transition-all"
                                          title="移除"
                                        >
                                           <Trash2 className="w-4 h-4" />
                                        </button>
                                     </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                </div>

                {/* Service Product List */}
                <div className="bg-black/20 p-8 border-t border-white/5 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-brand" />
                    <h4 className="text-[16px] font-black text-white">服务型产品清单</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        name: '履约服务费', 
                        selection: serviceMode === 'platform_standard' ? '平台标准服务' : serviceMode === 'regional_provider' ? '区域服务商服务' : '自助采购', 
                        fee: calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).platformServiceFee,
                        desc: serviceMode === 'self_service' ? '由用户自主完成工厂对接与下单' : '平台深度参与全流程核对与交付保障'
                      },
                      { 
                        name: '物流服务费', 
                        selection: logisticsLevel === 'none' ? '自有物流/自提' : logisticsLevel === 'economic' ? '经济物流' : logisticsLevel === 'standard' ? '标准物流' : logisticsLevel === '安心' ? '安心物流' : '品牌物流', 
                        fee: calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).logisticsEstimatedMin,
                        desc: logisticsLevel === 'none' ? '用户自行承担物流运输相关责任' : '预估费用，以最终发货单据为准'
                      },
                      { 
                        name: '送货安装费', 
                        selection: installationLevel === 'none' ? '不上楼不安装' : installationLevel === 'standard' ? '标准送装' : '复杂送装', 
                        fee: calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).deliveryInstallationFee,
                        desc: installationLevel === 'none' ? '需用户联系第三方或自行处理' : '专业团队上门服务'
                      },
                      { 
                        name: '售后保障费', 
                        selection: afterSalesLevel === 'none' ? '不购买额外保障' : afterSalesLevel === 'basic' ? '基础保障' : afterSalesLevel === '安心' ? '安心保障' : '尊享保障', 
                        fee: calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).afterSalesFee,
                        desc: afterSalesLevel === 'none' ? '仅享受厂家基础质保' : '平台额外提供的深度保障服务'
                      },
                      { 
                        name: '设计服务费', 
                        selection: designLevel === 'none' ? '不需要设计' : designLevel === 'consulting' ? '轻咨询' : designLevel === 'single' ? '单空间搭配' : '全案软装设计', 
                        fee: calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).designServiceFee,
                        desc: '专业设计师提供的空间规划与选品建议'
                      }
                    ].map((svc, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex justify-between items-center group hover:border-white/10 transition-colors">
                        <div className="text-left">
                          <p className="text-[11px] font-black text-brand uppercase tracking-widest mb-1">{svc.name}</p>
                          <p className="text-[14px] font-black text-white mb-0.5">{svc.selection}</p>
                          <p className="text-[11px] text-white/20 font-bold">{svc.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[18px] font-black text-white italic">¥{pricing.formatCurrency(svc.fee)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-10 bg-brand/5 border-t border-brand/10 flex justify-end">
                   <div className="w-full max-w-sm space-y-6">
                      <div className="space-y-3">
                         <div className="flex justify-between items-center text-[14px] font-bold">
                            <span className="text-white/40">实物产品清单小计</span>
                            <span className="text-white">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).factoryTotal)}</span>
                         </div>
                         <div className="flex justify-between items-center text-[14px] font-bold">
                            <span className="text-white/40">服务方案项目小计</span>
                            <span className="text-white">¥{pricing.formatCurrency(
                              calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).platformServiceFee +
                              calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).logisticsEstimatedMin +
                              calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).deliveryInstallationFee +
                              calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).afterSalesFee +
                              calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).designServiceFee
                            )}</span>
                         </div>
                         <div className="flex justify-between items-center text-[14px] font-bold text-brand">
                            <span>会员/集采已减免优惠</span>
                            <span>-¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).discountTotal || 0)}</span>
                         </div>
                      </div>

                      <div className="h-px bg-white/10" />

                      <div className="space-y-1">
                        <div className="flex justify-between items-end">
                           <span className="text-[18px] font-black text-white">预计总费用 (含税)</span>
                           <span className="text-[32px] font-black text-brand italic">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).estimatedTotal)}</span>
                        </div>
                         <p className="text-[11px] text-white/20 font-bold text-right italic">
                           总费用 = 实物产品 + 履约服务 + 物流 + 安装 + 保障 + 设计 - 优惠
                         </p>
                      </div>

                      <button 
                        onClick={() => {
                          if (productTotal === 0) {
                            onToast('请先添加产品至方案');
                            return;
                          }
                          setActiveTab('budget');
                        }}
                        className={`w-full py-5 mt-8 rounded-[32px] font-black text-[16px] shadow-xl transition-all ${isConfirmed ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-brand text-white hover:scale-[1.02]'}`}
                        disabled={isConfirmed}
                      >
                        {isConfirmed ? '方案已完成' : '下一步：查看预算与建议'}
                      </button>
                   </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-left">
            <div className="lg:col-span-8 space-y-8">
              {/* Service Mode Selection */}
              <div className="bg-[#1A1A1A] border border-white/5 rounded-[48px] p-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand/20 text-brand flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-black text-white">履约服务方式</h3>
                    <p className="text-[12px] text-white/40 font-bold">选择平台或服务商介入深度</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'self_service' as ServiceMode, name: '自助采购', desc: '工厂对接/自主下单', tag: '专业用户首选' },
                    { id: 'platform_standard' as ServiceMode, name: '平台标准服务', desc: '全流程核对/交付保障', tag: '省心推荐' },
                    { id: 'regional_provider' as ServiceMode, name: '区域服务商服务', desc: '本地化测量/安装/售后', tag: '深度本地化' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setServiceMode(mode.id)}
                      className={`p-6 rounded-[32px] border text-left transition-all relative overflow-hidden group ${serviceMode === mode.id ? 'bg-brand/10 border-brand/50' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                    >
                      {serviceMode === mode.id && <div className="absolute top-4 right-4 text-brand"><CheckCircle2 className="w-5 h-5" /></div>}
                      <span className="text-[10px] font-black text-brand/60 uppercase tracking-widest block mb-2">{mode.tag}</span>
                      <p className="text-[16px] font-black text-white mb-1">{mode.name}</p>
                      <p className="text-[12px] text-white/40 font-bold">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logistics Selection */}
              <div className="bg-[#1A1A1A] border border-white/5 rounded-[48px] p-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-black text-white">物流服务偏好</h3>
                    <p className="text-[12px] text-white/40 font-bold">不同速度与保障水平</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { id: 'none', name: '自有物流', desc: '自提/无需物流' },
                    { id: 'economic', name: '经济物流', desc: '性价比高' },
                    { id: 'standard', name: '标准物流', desc: '时效稳定' },
                    { id: '安心', name: '安心物流', desc: '全程无忧' },
                    { id: 'brand', name: '品牌物流', desc: '品牌直发' }
                  ].map(level => (
                    <button
                      key={level.id}
                      onClick={() => setLogisticsLevel(level.id as any)}
                      className={`p-5 rounded-3xl border text-left transition-all ${logisticsLevel === level.id ? 'bg-brand/10 border-brand/50' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                    >
                      <p className="text-[15px] font-black text-white mb-1">{level.name}</p>
                      <p className="text-[11px] text-white/40 font-bold">{level.desc}</p>
                    </button>
                  ))}
                </div>

                {isProfessional && (
                  <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <Settings className="w-4 h-4 text-brand" />
                       <span className="text-[12px] font-black text-white/60">高级物流设置 (仅限专业用户)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <div className="space-y-2 text-left">
                          <label className="text-[11px] font-black text-white/20 uppercase tracking-widest pl-1">指定物流公司/货代</label>
                          <input type="text" placeholder="输入公司名称" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[14px] text-white focus:border-brand outline-none" />
                       </div>
                       <div className="space-y-2 text-left">
                          <label className="text-[11px] font-black text-white/20 uppercase tracking-widest pl-1">物流点/自提详情</label>
                          <input type="text" placeholder="输入具体地点" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[14px] text-white focus:border-brand outline-none" />
                       </div>
                       <div className="space-y-2 text-left">
                          <label className="text-[11px] font-black text-white/20 uppercase tracking-widest pl-1">保价金额 (¥)</label>
                          <input type="text" placeholder="按需输入保价金额" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[14px] text-white focus:border-brand outline-none" />
                       </div>
                       <div className="space-y-2 text-left">
                          <label className="text-[11px] font-black text-white/20 uppercase tracking-widest pl-1">物流价格范围预设</label>
                          <input type="text" placeholder="如：500-1000" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[14px] text-white focus:border-brand outline-none" />
                       </div>
                       <div className="space-y-2 text-left">
                          <label className="text-[11px] font-black text-white/20 uppercase tracking-widest pl-1">预期时效 (天)</label>
                          <input type="text" placeholder="如：3-5天" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[14px] text-white focus:border-brand outline-none" />
                       </div>
                       <div className="space-y-2 text-left">
                          <label className="text-[11px] font-black text-white/20 uppercase tracking-widest pl-1">物流备注</label>
                          <input type="text" placeholder="特殊说明" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[14px] text-white focus:border-brand outline-none" />
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Installation */}
                <div className="bg-[#1A1A1A] border border-white/5 rounded-[48px] p-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h4 className="text-[18px] font-black text-white">送货安装</h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: 'none', name: '不上楼不安装', desc: '路边交付/自提' },
                      { id: 'standard', name: '标准送装', desc: '送货入户安装' },
                      { id: 'complex', name: '复杂送装', desc: '吊装/特殊加急' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setInstallationLevel(opt.id as any)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${installationLevel === opt.id ? 'bg-brand/10 border-brand/50 text-brand' : 'bg-white/5 border-transparent text-white/60 hover:border-white/10'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-black text-[14px]">{opt.name}</span>
                          <span className="text-[11px] opacity-40 font-bold">{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* After Sales */}
                <div className="bg-[#1A1A1A] border border-white/5 rounded-[48px] p-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-[18px] font-black text-white">售后保障</h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: 'none', name: '不购买额外保障', desc: '仅享受工厂质保' },
                      { id: 'basic', name: '基础保障', desc: '常见售后支持' },
                      { id: '安心', name: '安心保障', desc: '深度质量联保' },
                      { id: '尊享', name: '尊享保障', desc: '极致售后体验' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setAfterSalesLevel(opt.id as any)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${afterSalesLevel === opt.id ? 'bg-brand/10 border-brand/50 text-brand' : 'bg-white/5 border-transparent text-white/60 hover:border-white/10'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-black text-[14px]">{opt.name}</span>
                          <span className="text-[11px] opacity-40 font-bold">{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

               {/* Design Service */}
               <div className="bg-[#1A1A1A] border border-white/5 rounded-[48px] p-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-black text-white">全案软装设计服务</h3>
                      <p className="text-[12px] text-white/40 font-bold">由专业设计师为您把控全局</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { id: 'none', name: '不需要设计', desc: '自主选品搭配' },
                      { id: 'consulting', name: '轻咨询', desc: '远程建议/避雷' },
                      { id: 'single', name: '单空间搭配', desc: '核心区域精配' },
                      { id: 'full', name: '全案软装', desc: '整屋设计落地' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDesignLevel(opt.id as any)}
                        className={`p-5 rounded-3xl border text-left transition-all ${designLevel === opt.id ? 'bg-brand/10 border-brand/50' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                      >
                        <p className="text-[15px] font-black text-white mb-1">{opt.name}</p>
                        <p className="text-[11px] text-white/40 font-bold">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            <div className="lg:col-span-4 sticky top-32">
               <div className="bg-[#1A1A1A] border border-white/10 rounded-[48px] p-10 shadow-2xl space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[18px] font-black text-white">方案费用汇总</h4>
                      <p className="text-[11px] text-white/20 font-black uppercase tracking-widest">Pricing Summary</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">产品费用</span>
                      <span className="text-white">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).factoryTotal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">履约服务费 ({serviceMode === 'platform_standard' ? '标准' : serviceMode === 'regional_provider' ? '中心' : '自助'})</span>
                      <span className="text-white">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).platformServiceFee)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">物流预估 ({logisticsLevel === 'none' ? '自有' : logisticsLevel})</span>
                      <span className="text-white">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).logisticsEstimatedMin)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">送货安装预估</span>
                      <span className="text-white">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).deliveryInstallationFee)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">售后保障预估</span>
                      <span className="text-white">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).afterSalesFee)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">设计服务费</span>
                      <span className="text-white">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).designServiceFee)}</span>
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    <div className="flex justify-between items-center text-[14px] font-bold text-brand">
                      <span>已选优惠</span>
                      <span>-¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).discountTotal || 0)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-end">
                        <span className="text-[16px] font-black text-white">实际应付 (预估)</span>
                        <span className="text-[28px] font-black text-brand italic">¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).estimatedTotal)}</span>
                      </div>
                      <p className="text-[11px] text-white/20 font-bold text-right italic">总计：产品 + 服务 + 物流 + 设计</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                        setActiveTab('items');
                    }}
                    className="w-full py-6 bg-brand text-white rounded-[32px] font-black text-[18px] shadow-2xl shadow-brand/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    确认服务，查看选品清单 <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <MessageSquare className="w-5 h-5 text-brand" />
                    <p className="text-[12px] text-white/60 font-medium">配置遇到困难？联系专属管家协助完成交付设置。</p>
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
                            <span>¥{pricing.formatCurrency(calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).estimatedTotal)}</span>
                         </div>
                         <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).estimatedTotal / (plan.budget?.range?.includes('万') ? parseInt(plan.budget.range.split('-')[1].replace('万', '')) * 10000 : 150000)) * 100)}%` }}
                              className="h-full bg-white" 
                            />
                         </div>
                         <p className="text-[11px] font-bold mt-3 opacity-40">预算使用率：{Math.round((calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel }).estimatedTotal / (plan.budget?.range?.includes('万') ? parseInt(plan.budget.range.split('-')[1].replace('万', '')) * 10000 : 150000)) * 100)}%</p>
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
