import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ShoppingBag, Truck, Sparkles, 
  MapPin, Phone, User, MessageSquare, Clock, Building2, 
  Check, Star, AlertCircle, ShieldCheck, CreditCard,
  Package, Wrench, PenTool, ChevronRight
} from 'lucide-react';
import { planService } from '../services/planService';
import { orderService } from '../services/orderService';
import { serviceProviderService } from '../services/serviceProviderService';
import { analyticsService } from '../services/analyticsService';
import { membershipService } from '../services/membershipService';
import { ServiceMode, ServiceProvider, MemberType, UserMembership } from '../types/business';
import { pricing } from '../utils/pricing';
import { calculateOrderPricing } from '../utils/orderPricing';
import Breadcrumbs from '../components/Breadcrumbs';
import Toast from '../components/Toast';

export default function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  
  // Service Selections
  const [serviceMode, setServiceMode] = useState<ServiceMode>('platform_standard');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [afterSalesLevel, setAfterSalesLevel] = useState<'none' | 'basic' | '安心' | '尊享'>('basic');
  const [logisticsLevel, setLogisticsLevel] = useState<'economic' | 'standard' | '安心' | 'brand'>('standard');
  const [isDesignSelected, setIsDesignSelected] = useState(false);
  
  const [allProviders, setAllProviders] = useState<ServiceProvider[]>([]);
  const [showSelfServiceWarning, setShowSelfServiceWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wechat: '',
    city: '上海',
    community: '',
    address: '',
    move_in_time: '半年内',
    message: '',
    intent: 'consulting'
  });

  useEffect(() => {
    if (planId) {
      loadData();
      analyticsService.track('view_checkout_v5', { planId });
    }
  }, [planId]);

  const loadData = async () => {
    try {
      const [p, its, m, providers] = await Promise.all([
        planService.getPlanById(planId!),
        planService.getPlanItems(planId!),
        membershipService.getCurrentUserMembership(),
        serviceProviderService.getServiceProviders()
      ]);
      setPlan(p);
      setItems(its);
      setMembership(m);
      setAllProviders(providers);
      
      const memberType = m?.member_type || 'consumer';
      if (memberType === 'professional' || memberType === 'agent') {
        setServiceMode('self_service');
        setAfterSalesLevel('none');
      } else {
        setServiceMode('platform_standard');
        setAfterSalesLevel('basic');
      }
    } finally {
      setLoading(false);
    }
  };

  const pricingResult = useMemo(() => {
    return calculateOrderPricing({
      items,
      membership,
      serviceMode,
      selectedProvider: selectedProvider || undefined,
      logisticsLevel,
      afterSalesLevel,
    });
  }, [items, membership, serviceMode, selectedProvider, logisticsLevel, afterSalesLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setToastMessage('请填写联系人姓名和电话');
      return;
    }
    if (items.length === 0) {
      setToastMessage('方案中还没有产品，请先去选品');
      return;
    }
    try {
      setIsSubmitting(true);
      const order = await orderService.createOrderFromPlan(planId!, {
        ...formData,
        member_type: membership?.member_type || 'consumer',
        purchase_mode: serviceMode,
        service_mode: serviceMode,
        service_provider_id: selectedProvider?.id,
        service_provider_name: selectedProvider?.name,
        factory_total: pricingResult.factoryTotal,
        standard_service_price_total: pricingResult.standardServicePriceTotal,
        platform_service_fee: pricingResult.platformServiceFee,
        regional_service_fee: pricingResult.regionalServiceFee,
        after_sales_fee: pricingResult.afterSalesFee,
        logistics_fee_estimated_min: pricingResult.logisticsEstimatedMin,
        logistics_fee_estimated_max: pricingResult.logisticsEstimatedMax,
        delivery_installation_fee: pricingResult.deliveryInstallationFee,
        design_service_fee: pricingResult.designServiceFee,
        estimated_total: pricingResult.estimatedTotal,
      });
      analyticsService.track('submit_lead_order_v5', { orderId: order.id, planId });
      setToastMessage('方案需求已提交成功！');
      setTimeout(() => navigate(`/orders/${order.id}`), 1500);
    } catch (error) {
      console.error(error);
      setToastMessage('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" /></div>;
  if (!plan) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white/30 font-black">方案未找到</div>;

  const memberTypeLabels: Record<MemberType, string> = {
    guest: '访客',
    consumer: '买家',
    consulting: '会员',
    professional: '专业 PRO',
    agent: '服务商',
    admin: '管理'
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-24 md:pb-40 text-left overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="mb-8 hidden md:block">
           <Breadcrumbs isDark items={[{ name: '我的方案', path: '/my-plans' }, { name: '结算中心' }]} />
        </div>

        {/* Identity Identity */}
        <div className="bg-[#141414] border border-white/5 rounded-[24px] md:rounded-[32px] p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px] pointer-events-none" />
          <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
             <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0"><User className="w-6 h-6 md:w-8 md:h-8" /></div>
             <div>
                <div className="flex items-center gap-3">
                   <h2 className="text-[18px] md:text-[20px] font-black text-white">结算口径</h2>
                   <span className="px-3 py-1 bg-brand text-white rounded-lg text-[11px] font-bold uppercase tracking-widest leading-none">
                     {memberTypeLabels[membership?.member_type || 'consumer']}
                   </span>
                </div>
                <p className="text-white/30 text-[13px] md:text-[14px] mt-1 font-medium line-clamp-1">已根据身份自动预设最佳优惠逻辑。</p>
             </div>
          </div>
          <Link to="/membership" className="w-full md:w-auto px-6 py-3 bg-white/5 text-white/50 rounded-xl text-[13px] font-black text-center transition-colors">切换身份 / 升级会员</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 md:gap-16">
          <div className="flex-1 space-y-10 md:space-y-16">
            <header className="text-left">
              <h1 className="text-[32px] md:text-[42px] font-black text-white mb-4 tracking-tight">方案服务配置</h1>
              <p className="text-[15px] md:text-[18px] text-white/40 leading-relaxed italic">厂家出厂价透明，您可以按需组合履约与物流服务包。</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[40px] p-6 md:p-10 space-y-8">
                <h3 className="text-[18px] md:text-[20px] font-black text-white flex items-center gap-3"><Sparkles className="w-5 h-5 md:w-6 md:h-6 text-brand" /> 02. 选择履约服务方式</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                   <button type="button" onClick={() => { setServiceMode('self_service'); if (!membership || membership.member_type === 'consumer') setShowSelfServiceWarning(true); }} className={`p-6 rounded-[28px] border text-left flex flex-col h-full transition-all ${serviceMode === 'self_service' ? 'bg-white border-white' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex justify-between mb-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serviceMode === 'self_service' ? 'bg-black text-white' : 'bg-white/10 text-white/30'}`}><User className="w-5 h-5" /></div>{serviceMode === 'self_service' && <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div>}</div>
                      <h4 className={`text-[17px] font-black mb-1 ${serviceMode === 'self_service' ? 'text-black' : 'text-white'}`}>自助采购</h4>
                      <p className={`text-[11px] font-black mb-4 ${serviceMode === 'self_service' ? 'text-black/60' : 'text-brand'}`}>¥0 开支</p>
                      <p className={`text-[12px] font-medium leading-relaxed ${serviceMode === 'self_service' ? 'text-black/40' : 'text-white/20'}`}>由您直接联系厂家，自行负责所有交付与售后风险。</p>
                   </button>
                   <button type="button" onClick={() => { setServiceMode('platform_standard'); setSelectedProvider(null); }} className={`p-6 rounded-[28px] border text-left flex flex-col h-full transition-all ${serviceMode === 'platform_standard' ? 'bg-brand border-brand shadow-xl' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex justify-between mb-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serviceMode === 'platform_standard' ? 'bg-white text-brand' : 'bg-white/10 text-white/30'}`}><Sparkles className="w-5 h-5" /></div>{serviceMode === 'platform_standard' && <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5 text-brand" /></div>}</div>
                      <h4 className="text-[17px] font-black mb-1 text-white">平台标准服务</h4>
                      <p className="text-[11px] font-black mb-4 text-white/60">出厂价 × 20%</p>
                      <p className="text-[12px] font-medium leading-relaxed text-white/40">DXG 官方负责全流程跟进与异常纠偏。</p>
                   </button>
                   <button type="button" onClick={() => setServiceMode('regional_provider')} className={`p-6 rounded-[28px] border text-left flex flex-col h-full transition-all ${serviceMode === 'regional_provider' ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex justify-between mb-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serviceMode === 'regional_provider' ? 'bg-brand text-white' : 'bg-white/10 text-white/30'}`}><Building2 className="w-5 h-5" /></div>{serviceMode === 'regional_provider' && <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div>}</div>
                      <h4 className="text-[17px] font-black mb-1 text-white">区域服务商</h4>
                      <p className="text-[11px] font-black mb-4 text-white/40">按选定服务商报价</p>
                      <p className="text-[12px] font-medium leading-relaxed text-white/20">由本地专业团队提供上门沟通与深度交付。</p>
                   </button>
                </div>
                {serviceMode === 'regional_provider' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                     {allProviders.map(p => (
                       <div key={p.id} onClick={() => setSelectedProvider(p)} className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedProvider?.id === p.id ? 'bg-white/10 border-brand' : 'bg-white/5 border-white/5'}`}><h5 className="font-black text-white text-[15px]">{p.name}</h5><p className="text-[11px] text-white/30 font-bold mt-1">评分 {p.rating} · 已服务 {p.completed_order_count} 单</p><p className="text-brand text-[13px] font-black italic mt-3">+{p.service_rate}%</p></div>
                     ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                 <div className="bg-[#141414] border border-white/5 rounded-[32px] p-6 md:p-10 space-y-6">
                    <h3 className="text-[18px] md:text-[20px] font-black text-white flex items-center gap-3"><Truck className="w-5 h-5 text-brand" /> 03. 物流等级</h3>
                    <div className="space-y-3">
                       {['economic', 'standard', '安心', 'brand'].map(l => (
                         <button key={l} type="button" onClick={() => setLogisticsLevel(l as any)} className={`w-full p-4 md:p-6 rounded-2xl border text-left flex items-center justify-between transition-all ${logisticsLevel === l ? 'bg-white/10 border-brand' : 'bg-white/5 border-white/5'}`}>
                            <div><h5 className={`text-[13px] md:text-[14px] font-black uppercase tracking-wider ${logisticsLevel === l ? 'text-brand' : 'text-white'}`}>{l === 'economic' ? '经济物流' : l === 'standard' ? '标准物流' : l === '安心' ? '安心物流' : '品牌特快'}</h5><p className="text-[10px] md:text-[11px] text-white/20 font-medium">适合各种配套需求</p></div>
                            <span className="text-[10px] font-black text-white/20 italic">{l === 'economic' ? '8-10天' : '4-6天'}</span>
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="bg-[#141414] border border-white/5 rounded-[32px] p-6 md:p-10 space-y-6">
                    <h3 className="text-[18px] md:text-[20px] font-black text-white flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-brand" /> 04. 售后保障</h3>
                    <div className="space-y-3">
                       {['none', 'basic', '安心', '尊享'].map(l => (
                         <button key={l} type="button" onClick={() => setAfterSalesLevel(l as any)} className={`w-full p-4 md:p-6 rounded-2xl border text-left flex items-center justify-between transition-all ${afterSalesLevel === l ? 'bg-white/10 border-brand' : 'bg-white/5 border-white/5'}`}>
                            <div><h5 className={`text-[13px] md:text-[14px] font-black tracking-wider ${afterSalesLevel === l ? 'text-brand' : 'text-white'}`}>{l === 'none' ? '无保障' : l === 'basic' ? '入门保障' : l === '安心' ? '安心保障' : '尊享全免'}</h5><p className="text-[10px] md:text-[11px] text-white/20 font-medium">{l === 'none' ? '自助采购预设' : '极速补寄'}</p></div>
                            <span className="text-[12px] font-black text-brand italic">{l === 'none' ? '¥0' : l === 'basic' ? '含' : '3%'}</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="bg-[#141414] border border-white/5 rounded-[32px] p-6 md:p-10 space-y-6 text-left">
                <h3 className="text-[18px] font-black text-white flex items-center gap-3"><MapPin className="w-5 h-5 text-brand" /> 07. 联系信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[11px] font-black text-white/20 uppercase tracking-widest pl-1">联系姓名</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold" /></div>
                  <div className="space-y-2"><label className="text-[11px] font-black text-white/20 uppercase tracking-widest pl-1">联系电话</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold" /></div>
                </div>
              </div>

              {/* Mobile Only Summary Header */}
              <div className="lg:hidden p-6 bg-white/5 rounded-[32px] border border-white/5 text-left">
                 <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-4">估算总额预览</p>
                 <div className="flex justify-between items-end">
                    <div><p className="text-[12px] text-white/40 font-bold">方案预计总价</p><p className="text-[10px] text-brand font-black mt-1">包含标准履约与物流</p></div>
                    <p className="text-[32px] font-black text-white italic leading-none">¥{pricing.formatCurrency(pricingResult.estimatedTotal)}</p>
                 </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-white text-black rounded-[28px] md:rounded-[32px] font-black text-[18px] md:text-[20px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {isSubmitting ? '正在提交...' : '提交方案采购需求'} {isSubmitting ? null : <ShoppingBag className="w-6 h-6" />}
              </button>
            </form>
          </div>

          <div className="lg:w-[400px] shrink-0">
             <div className="sticky top-40 bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[40px] p-8 shadow-2xl text-left">
                <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-8">费用汇总 / Summary</p>
                <div className="space-y-5 mb-10">
                   <div className="flex justify-between text-[14px]"><span className="text-white/40 font-bold">产品出厂总额</span><span className="text-white font-black">¥{pricing.formatCurrency(pricingResult.factoryTotal)}</span></div>
                   <div className="flex justify-between items-start text-[14px]"><div className="flex flex-col"><span className="text-white/40 font-bold">履约服务费用</span><span className="text-[10px] text-white/20 font-black uppercase tracking-wider">{serviceMode === 'self_service' ? '自助采购' : '底线哥及服务商'}</span></div><span className="text-white font-black">¥{pricing.formatCurrency(pricingResult.platformServiceFee + pricingResult.regionalServiceFee)}</span></div>
                   <div className="flex justify-between text-[14px]"><span className="text-white/40 font-bold">售后保障等级 ({afterSalesLevel})</span><span className="text-white font-black">¥{pricing.formatCurrency(pricingResult.afterSalesFee)}</span></div>
                   <div className="flex justify-between text-[14px]"><span className="text-white/40 font-bold">物流预估</span><span className="text-white/40 font-bold italic">¥{pricing.formatCurrency(pricingResult.logisticsEstimatedMin)}...</span></div>
                </div>
                <div className="h-px bg-white/5 mb-8" />
                <div className="flex justify-between items-end mb-10">
                   <div className="flex flex-col gap-1"><span className="text-white/40 text-[13px] font-bold">方案预计总价</span><span className="text-[10px] text-white/20 font-black tracking-widest">Estimated</span></div>
                   <p className="text-[36px] font-black text-white italic leading-none tracking-tighter">¥{pricing.formatCurrency(pricingResult.estimatedTotal)}</p>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3"><div className="flex gap-3 text-[12px] font-medium text-white/30 italic"><ShieldCheck className="w-4 h-4 text-brand shrink-0" />物流费根据体积实报实销。</div><div className="flex gap-3 text-[12px] font-medium text-white/30 italic"><Clock className="w-4 h-4 text-brand/40 shrink-0" />备货周期 15-20 天。</div></div>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSelfServiceWarning && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSelfServiceWarning(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#1A1A1A] border border-white/10 rounded-[40px] p-8 md:p-12 max-w-lg w-full text-center space-y-8 relative z-10">
              <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto"><AlertCircle className="w-10 h-10" /></div>
              <div><h3 className="text-[24px] md:text-[28px] font-black text-white mb-4 italic">自助采购风险告知</h3><p className="text-white/40 font-medium leading-relaxed italic">自助采购模式下，底线哥仅作为信息提供方。您需自行承担所有履约、质量及售后风险。</p></div>
              <div className="flex flex-col gap-3"><button onClick={() => setShowSelfServiceWarning(false)} className="w-full py-5 bg-white text-black rounded-2xl font-black text-[16px]">了解并继续</button><button onClick={() => { setServiceMode('platform_standard'); setShowSelfServiceWarning(false); }} className="w-full py-5 bg-white/5 text-white/40 rounded-2xl font-black text-[16px]">返回平台服务包</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </main>
  );
}
