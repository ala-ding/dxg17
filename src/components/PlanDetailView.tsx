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
  Lock,
  Zap,
  Truck,
  Settings,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { UserPlan, PlanProduct } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
import { UserMembership, ServiceMode, PlanItem, OrderType } from '../types/business';
import { paymentService } from '../services/paymentService';
import { authService } from '../services/authService';

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
  
  const [serviceMode, setServiceMode] = useState<ServiceMode>('platform_standard');
  const [logisticsLevel, setLogisticsLevel] = useState<'none' | 'economic' | 'standard' | '安心' | 'brand'>('standard');
  const [afterSalesLevel, setAfterSalesLevel] = useState<'none' | 'basic' | '安心' | '尊享'>('basic');
  const [installationLevel, setInstallationLevel] = useState<'none' | 'standard' | 'complex'>('standard');
  const [designLevel, setDesignLevel] = useState<'none' | 'consulting' | 'single' | 'full'>('none');
  const [unlockStatus, setUnlockStatus] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  
  useEffect(() => {
    membershipService.getCurrentUserMembership().then(m => {
      setMembership(m);
      if (m?.member_type === 'professional' || m?.member_type === 'agent') {
        setServiceMode('self_service');
        setAfterSalesLevel('none');
      }
    });

    if (isSupabaseConfigured && supabase) {
       planService.getPlanById(plan.id).then(p => {
         if (p?.unlock_status) setUnlockStatus(p.unlock_status);
       });
    } else {
       const unlocks = JSON.parse(localStorage.getItem('dxg_plan_unlocks') || '{}');
       if (unlocks[plan.id]) setUnlockStatus(unlocks[plan.id]);
    }
  }, [plan.id]);

  const isProfessional = membership?.member_type === 'professional' || membership?.member_type === 'agent';
  const isConsulting = membership?.plan_code === 'consulting';
  const isUnlocked = isProfessional || isConsulting || unlockStatus?.unlocked;

  const handleUnlockPlan = async (tier: 'basic' | 'professional') => {
    try {
      const amount = tier === 'professional' ? 99 : 29;
      setIsPaying(true);
      const order = await paymentService.createPlanUnlockOrder(plan.id, tier, amount);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await paymentService.mockPayMembershipOrder(order.id);
      onToast(`已成功解锁方案清单（${tier === 'professional' ? '专业版' : '基础版'}）`);
      const newStatus = { unlocked: true, type: tier, unlocked_at: new Date().toISOString(), order_id: order.id };
      setUnlockStatus(newStatus);
      onUpdate();
    } catch (e: any) {
      onToast(`解锁失败: ${e.message}`);
    } finally {
      setIsPaying(false);
    }
  };

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
      <div className="w-full py-20 bg-[#1A1A1A] rounded-[32px] md:rounded-[48px] border border-white/5 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-6">
          <Package className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <p className="text-[18px] font-black text-white mb-2">这个方案还没有选品</p>
        <p className="text-[14px] text-white/20 font-bold mb-8">开始添加你喜欢的单品来完善方案吧</p>
        <button 
          onClick={() => navigate('/products?fromPlan=' + plan.id)}
          className="w-full sm:w-auto px-10 h-14 bg-brand text-white rounded-full font-black text-[15px] shadow-xl shadow-brand/20"
        >
          去库中添加产品
        </button>
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
    setLastRemovedItem({ item, spaceId });
    try {
      await planService.removeProductFromPlan(plan.id, productId);
      onUpdate();
      onToast(`已移除「${item.name}」`, {
        label: '撤销',
        onClick: async () => { if (item) { await planService.addProductToPlan(plan.id, item, item.quantity || 1, spaceId); onUpdate(); } }
      });
    } catch (e: any) { onToast(`移除失败: ${e.message}`); }
  };

  const currentPricing = calculateOrderPricing({ items: allItems as any[], membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel });
  const isConfirmed = plan.status === 'completed' || (plan.status as string) === 'confirmed';

  const getAiAdvice = () => {
    const comp = plan.completion || 0;
    if (comp < 30) return "方案目前非常空。建议至少先完善主卧和客厅的核心家具，以便 AI 进行初步风格锁定。";
    if (comp < 60) return "当前的搭配逻辑已经初见端倪。空间中还缺少一些氛围灯具和地毯，这些是提升高级感的关键。";
    return "非常完美的方案！这套搭配目前在 3-5 万预算内极具性价比，品牌溢价与材质表现达到了高平衡点。";
  };

  return (
    <div className="w-full space-y-8 md:space-y-10">
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar -mx-6 px-6">
        {[
          { id: 'display', label: '展示' },
          { id: 'delivery', label: '交付' },
          { id: 'items', label: '清单' },
          { id: 'budget', label: '建议' },
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 md:px-8 py-4 text-[15px] font-black transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-brand' : 'text-white/40'}`}
          >
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-brand" />}
          </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === 'display' && (
          <div className="space-y-8 md:space-y-10">
            <div className="relative aspect-[4/5] md:aspect-[16/9] bg-[#1A1A1A] rounded-[24px] md:rounded-[48px] overflow-hidden shadow-2xl border border-white/5 group">
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-60 md:opacity-80" alt="Mood" />
              <div className="absolute inset-0 z-10 p-4 md:p-12 overflow-hidden">
                 {allItems.slice(0, 3).map((p, i) => (
                   <div key={p.id} className="absolute group/dot scale-75 md:scale-100" style={{ top: `${35 + i * 15}%`, left: i % 2 === 0 ? '25%' : 'auto', right: i % 2 === 1 ? '25%' : 'auto' }}>
                     <div onClick={() => onProductClick(p, activeTab)} className="w-8 h-8 rounded-full bg-brand/80 backdrop-blur-md border border-white/50 flex items-center justify-center animate-pulse cursor-pointer">
                       <ShoppingBag className="w-4 h-4 text-white" />
                     </div>
                   </div>
                 ))}
              </div>
              <div className="absolute top-4 md:top-12 left-4 md:left-12 z-20 max-w-[calc(100%-32px)]">
                  <div className="bg-black/60 backdrop-blur-2xl px-4 md:px-6 py-3 md:py-4 rounded-[20px] md:rounded-[28px] border border-white/10 flex items-center justify-between gap-4">
                     <div className="min-w-0">
                        <h3 className="text-[17px] md:text-[24px] font-bold text-white italic font-serif truncate">{plan.name || '未命名'}</h3>
                     </div>
                     <button onClick={() => onRename?.()} className="p-2 md:p-3 bg-white/5 text-white/40 hover:text-brand rounded-xl md:rounded-2xl transition-all"><Edit3 className="w-4 h-4 md:w-5 h-5" /></button>
                  </div>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <button 
                onClick={() => setActiveTab('delivery')}
                className="w-full sm:w-auto px-10 py-5 bg-brand text-white rounded-full font-black text-[16px] shadow-2xl flex items-center justify-center gap-3"
              >
                下一步：配置服务 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
               <div className="bg-[#1A1A1A] border border-white/5 rounded-[32px] p-8 text-left">
                  <h4 className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-6">配色 Color</h4>
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-[#5D5C43]" /><div className="text-left font-black text-white">苔藓绿</div></div>
                     <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-[#D7C4A5]" /><div className="text-left font-black text-white">暖沙色</div></div>
                  </div>
               </div>
               <div className="md:col-span-2 bg-[#1A1A1A] border border-white/5 rounded-[32px] p-6 md:p-8 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                     <h4 className="text-[11px] font-black text-white/20 uppercase tracking-widest">关联产品</h4>
                     <button onClick={() => navigate(`/products?fromPlan=${plan.id}`)} className="text-[12px] font-bold text-brand">+ 添加</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                     {allItems.map((p, i) => (
                       <div key={p.id} onClick={() => onProductClick(p, activeTab)} className="w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-[24px] md:rounded-[32px] p-3 flex-shrink-0 flex items-center justify-center relative cursor-pointer border border-white/10">
                          <img src={p.image || null} className="w-full h-full object-contain" alt="" />
                          {p.quantity > 1 && <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-brand text-white text-[10px] font-black rounded-full">x{p.quantity}</div>}
                       </div>
                     ))}
                     <button onClick={() => navigate(`/products?fromPlan=${plan.id}`)} className="w-24 h-24 md:w-32 md:h-32 bg-brand/5 border border-dashed border-brand/20 rounded-[24px] md:rounded-[32px] flex items-center justify-center text-brand flex-shrink-0"><Plus className="w-8 h-8" /></button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6 md:space-y-8 relative">
            {!isUnlocked && (
              <div className="absolute inset-0 z-[50] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl rounded-[32px] md:rounded-[40px] border border-white/10">
                 <div className="max-w-md w-full bg-[#111] p-6 md:p-10 rounded-[32px] md:rounded-[40px] text-center border border-white/10 shadow-2xl">
                    <Lock className="w-10 h-10 text-brand mx-auto mb-6" />
                    <h3 className="text-[20px] md:text-[24px] font-black text-white mb-4">解锁完整清单</h3>
                    <p className="text-white/40 text-[14px] mb-8">预览模式受限，解锁后查看完整参数与采购建议。</p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                       <button onClick={() => handleUnlockPlan('basic')} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left h-28 flex flex-col justify-between">
                          <span className="text-[13px] font-black text-white">基础版</span>
                          <span className="text-[18px] font-black text-white">¥29</span>
                       </button>
                       <button onClick={() => handleUnlockPlan('professional')} className="p-4 bg-brand/10 border border-brand/20 rounded-2xl text-left h-28 flex flex-col justify-between">
                          <span className="text-[13px] font-black text-brand">专业版</span>
                          <span className="text-[18px] font-black text-brand">¥99</span>
                       </button>
                    </div>
                    <button onClick={() => navigate('/membership')} className="text-[13px] font-black text-brand hover:underline">会员专享，查看权益</button>
                 </div>
              </div>
            )}

            <div className={`flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1A1A1A] border border-white/10 p-5 md:p-6 rounded-[24px] md:rounded-[32px] ${!isUnlocked && 'blur-sm select-none pointer-events-none'}`}>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand/10 rounded-full"><span className="w-2 h-2 bg-brand rounded-full animate-pulse" /><span className="text-[12px] font-black text-brand">已锁定</span></div>
                  <span className="text-[14px] text-white/40 font-bold">{uniqueProductsCount} 款产品 / {totalQuantity} 件</span>
                </div>
                <div className="flex w-full md:w-auto gap-3">
                  <button onClick={() => exportPlanCsv(plan, { membership, serviceMode, logisticsLevel, afterSalesLevel, installationLevel, designLevel })} className="flex-1 md:flex-none h-11 px-6 bg-white text-black rounded-full font-black text-[13px] flex items-center justify-center gap-2"><Share2 className="w-3.5 h-3.5" /> 导出</button>
                  <button onClick={() => navigate(`/products?fromPlan=${plan.id}`)} className="flex-1 md:flex-none h-11 px-6 bg-white/5 text-white border border-white/10 rounded-full font-black text-[13px]">+ 加品</button>
                </div>
            </div>

            <div className={`bg-[#1A1A1A] border border-white/5 rounded-[24px] md:rounded-[40px] overflow-hidden ${!isUnlocked && 'blur-sm select-none pointer-events-none'}`}>
                 <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[800px] text-left">
                       <thead className="bg-black/40 text-[12px] text-white/30 uppercase tracking-widest font-black border-b border-white/5">
                          <tr>
                            <th className="px-6 py-4">产品 / 空间</th>
                            <th className="px-6 py-4 text-center">数量</th>
                            <th className="px-6 py-4 text-right">结算总额</th>
                            <th className="px-6 py-4 text-right">操作</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {plan.spaces?.map(space => space.items?.map(item => (
                             <tr key={item.id} className="group hover:bg-white/[0.02]">
                                <td className="px-6 py-5">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-white rounded-lg p-1.5 shrink-0 border border-white/10 overflow-hidden">
                                         <img src={item.image || null} className="w-full h-full object-contain" alt="" />
                                      </div>
                                      <div className="min-w-0">
                                         <p className="font-black text-white text-[14px] truncate">{item.name}</p>
                                         <span className="text-[10px] text-brand/60 font-black uppercase tracking-widest">{space.name}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-5">
                                   <div className="flex items-center justify-center gap-3">
                                      <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-7 h-7 rounded-lg bg-white/5 text-white/40">-</button>
                                      <span className="text-[14px] font-black text-white">{item.quantity || 1}</span>
                                      <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-7 h-7 rounded-lg bg-white/5 text-white/40">+</button>
                                   </div>
                                </td>
                                <td className="px-6 py-5 text-right font-black text-white text-[15px]">
                                   ¥{pricing.formatCurrency((isProfessional ? (item.product_snapshot?.factory_price || item.price || 0) : (item.product_snapshot?.standard_service_price || Math.round((item.price || 0) * 1.2))) * (item.quantity || 1))}
                                </td>
                                <td className="px-6 py-5 text-right">
                                   <button onClick={() => handleRemoveItem(item.id, space.id)} className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                </td>
                             </tr>
                          )))}
                       </tbody>
                    </table>
                 </div>
                 <div className="p-6 md:p-10 bg-brand/5 border-t border-brand/10 text-left">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                       <div className="space-y-4 max-w-sm">
                          <h4 className="text-[15px] font-black text-brand">服务方案</h4>
                          <ul className="space-y-3 text-[13px] text-white/60 font-bold">
                             <li className="flex justify-between"><span>履约：{serviceMode === 'platform_standard' ? '标准' : '自助'}</span> <span className="text-white">¥{pricing.formatCurrency(currentPricing.platformServiceFee)}</span></li>
                             <li className="flex justify-between"><span>物流：{logisticsLevel}</span> <span className="text-white">¥{pricing.formatCurrency(currentPricing.logisticsEstimatedMin)}</span></li>
                             <li className="flex justify-between"><span>安装：{installationLevel === 'none' ? '自理' : '送装'}</span> <span className="text-white">¥{pricing.formatCurrency(currentPricing.deliveryInstallationFee)}</span></li>
                          </ul>
                       </div>
                       <div className="text-center md:text-right space-y-2">
                          <p className="text-[13px] text-white/20 font-black uppercase tracking-widest">Estimated Total / 预估总额</p>
                          <p className="text-[36px] md:text-[48px] font-black text-brand italic">¥{pricing.formatCurrency(currentPricing.estimatedTotal)}</p>
                          <button onClick={() => setActiveTab('budget')} className="w-full md:w-[280px] h-14 bg-brand text-white rounded-full font-black text-[15px] mt-4 active:scale-95 transition-all">确认清单并查看建议</button>
                       </div>
                    </div>
                 </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start text-left">
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
              <div className="bg-[#1A1A1A] border border-white/5 rounded-[32px] md:rounded-[48px] p-6 md:p-10">
                <h3 className="text-[18px] md:text-[20px] font-black text-white mb-6">履约服务方式</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'self_service', name: '自助', desc: '工厂直供' },
                    { id: 'platform_standard', name: '平台标准', desc: '全托代管' },
                    { id: 'regional_provider', name: '服务商', desc: '本地深度' }
                  ].map(m => (
                    <button key={m.id} onClick={() => setServiceMode(m.id as any)} className={`p-5 rounded-2xl border text-left transition-all ${serviceMode === m.id ? 'bg-brand/10 border-brand/50 text-brand' : 'bg-white/5 border-transparent text-white/40'}`}>
                      <p className="font-black text-[15px]">{m.name}</p>
                      <p className="text-[11px] font-bold opacity-60">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#1A1A1A] border border-white/5 rounded-[32px] md:rounded-[48px] p-6 md:p-10">
                <h3 className="text-[18px] md:text-[20px] font-black text-white mb-6">送装偏好</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'none', label: '物流', name: '自有自备', desc: '无需物流' },
                    { id: 'standard', label: '物流', name: '标准时效', desc: '稳定快捷' },
                    { id: 'none', label: '安装', name: '无需送装', desc: '自行处理' },
                    { id: 'standard', label: '安装', name: '平台入户', desc: '标准送装' }
                  ].map((level, i) => (
                    <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center"><div className="text-left"><span className="text-[10px] text-brand font-black block mb-1">{level.label}</span><p className="text-white font-black">{level.name}</p></div><CheckCircle2 className="w-5 h-5 text-white/10" /></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 sticky top-24 md:top-32 h-fit">
               <div className="bg-brand rounded-[32px] md:rounded-[40px] p-8 md:p-10 text-white shadow-2xl space-y-6">
                  <h4 className="text-[18px] md:text-[20px] font-black">结算预估</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-[13px] font-bold opacity-80"><span>产品总额</span><span>¥{pricing.formatCurrency(currentPricing.factoryTotal)}</span></div>
                     <div className="flex justify-between items-center text-[13px] font-bold opacity-80"><span>服务税费</span><span>¥{pricing.formatCurrency(currentPricing.platformServiceFee)}</span></div>
                     <div className="h-px bg-white/10 my-4" />
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-black uppercase opacity-40">Estimated Total</span>
                        <span className="text-[32px] md:text-[40px] font-black italic">¥{pricing.formatCurrency(currentPricing.estimatedTotal)}</span>
                     </div>
                  </div>
                  <button onClick={() => setActiveTab('items')} className="w-full h-14 bg-white text-brand rounded-full font-black text-[15px] shadow-lg active:scale-95 transition-all">生成完整清单</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 text-left">
             <div className="lg:col-span-8 space-y-6 md:space-y-8">
                <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] md:rounded-[48px] p-8 md:p-12">
                   <div className="flex items-center gap-4 mb-10">
                      <Sparkles className="w-10 h-10 text-brand" />
                      <h3 className="text-[24px] md:text-[28px] font-black text-white">AI 分析报告</h3>
                   </div>
                   <div className="p-6 md:p-8 bg-brand/5 border border-brand/20 rounded-3xl mb-8">
                      <p className="text-[16px] md:text-[18px] font-bold text-white italic leading-relaxed">“{getAiAdvice()}”</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4"><span className="text-[11px] font-black text-brand tracking-widest uppercase">推荐保留项</span>{['真皮沙发组', '独立弹簧床垫', '全遮光窗帘'].map(l => <div key={l} className="p-4 bg-white/5 rounded-2xl text-white/80 font-bold flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" />{l}</div>)}</div>
                      <div className="space-y-4"><span className="text-[11px] font-black text-orange-400 tracking-widest uppercase">优化建议项</span>{['大尺寸地毯', '全屋装饰画', '智能氛围灯'].map(l => <div key={l} className="p-4 bg-white/5 rounded-2xl text-white/80 font-bold flex items-center gap-3"><AlertCircle className="w-4 h-4 text-orange-400" />{l}</div>)}</div>
                   </div>
                </div>
             </div>
             <div className="lg:col-span-4 h-fit">
                <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col items-center">
                   <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[8px] border-white/5 flex flex-col items-center justify-center mb-6">
                      <span className="text-[32px] md:text-[40px] font-black text-brand leading-none">{plan.completion || 0}%</span>
                      <span className="text-[10px] font-black text-white/20 mt-1 uppercase">完成度</span>
                   </div>
                   <p className="text-[14px] text-white/40 font-bold text-center">资料越完整，AI 匹配出的方案性价比越高。</p>
                   <button onClick={onEditRequirements} className="w-full mt-8 h-12 border border-white/10 rounded-full text-white/60 font-black hover:bg-white/5 transition-all">补充资料</button>
                </div>
             </div>
          </div>
        )}
      </div>

      <BudgetCompareModal
        open={isCompareOpen} onClose={() => setIsCompareOpen(false)} currentPlan={plan}
        template={planService.getPlanTemplateById(plan.budgetLimit?.includes('15') ? 'S1' : 'P1') || planService.getPlanTemplates()[0]}
        onApplyTemplate={async () => {
          const template = planService.getPlanTemplateById('P1');
          if (template) { await planService.addTemplateMissingItemsToPlan(plan.id, template.id); onUpdate(); onToast('已补齐推荐项'); }
        }}
      />
    </div>
  );
}
