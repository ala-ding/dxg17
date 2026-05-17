import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
      
      // Default rules based on membership
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
      setTimeout(() => {
        navigate(`/orders/${order.id}`);
      }, 1500);
    } catch (error) {
      console.error(error);
      setToastMessage('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-40 px-12"><div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  if (!plan) return <div className="min-h-screen pt-40 px-12 text-center text-white/40">方案未找到</div>;

  const memberTypeLabels: Record<MemberType, string> = {
    guest: '游客',
    consumer: '普通买家',
    consulting: '咨询会员',
    professional: '专业会员 PRO',
    agent: '区域服务商',
    admin: '管理员'
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-40 text-left">
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs 
          isDark={true}
          items={[
            { name: '我的方案', path: '/my-plans' },
            { name: '结算中心' }
          ]} 
        />
        
        {/* Module 1: Current Identity */}
        <div className="bg-[#141414] border border-white/5 rounded-[32px] p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                <User className="w-8 h-8" />
             </div>
             <div>
                <div className="flex items-center gap-3">
                   <h2 className="text-[20px] font-black text-white">{membership?.user_id ? '当前身份：' : '访客身份'}</h2>
                   <span className="px-3 py-1 bg-brand text-white rounded-lg text-[12px] font-bold uppercase tracking-widest leading-none">
                     {memberTypeLabels[membership?.member_type || 'consumer']}
                   </span>
                </div>
                <p className="text-white/40 text-[14px] mt-1 font-medium italic">根据您的会员权益，已自动为您预设最佳结算口径。</p>
             </div>
          </div>
          <Link to="/membership" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-[14px] font-black transition-all flex items-center gap-2">
            切换身份 / 升级会员 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Selection Area */}
          <div className="flex-1 space-y-12">
            <header>
              <h1 className="text-[42px] font-black text-white mb-4">方案服务配置</h1>
              <p className="text-[18px] text-white/40 leading-relaxed">产品出厂价透明，您可以根据需求自由组合履约、物流、售后及设计服务包。</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Module 2: Fulfillment Service (The Master Gate) */}
              <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10 space-y-8">
                <div className="flex flex-col gap-2">
                   <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-brand" /> 02. 履约服务方式
                   </h3>
                   <p className="text-[14px] text-white/40 font-medium italic">选择由谁负责您的产品核对、厂家对接和交付跟进。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <button 
                    type="button"
                    onClick={() => {
                      setServiceMode('self_service');
                      if (membership?.member_type === 'consumer' || !membership) {
                        setShowSelfServiceWarning(true);
                      }
                    }}
                    className={`p-6 rounded-[32px] border text-left transition-all relative flex flex-col h-full ${serviceMode === 'self_service' ? 'bg-white border-white' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                   >
                     <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serviceMode === 'self_service' ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
                          <User className="w-5 h-5" />
                        </div>
                        {serviceMode === 'self_service' && <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                     </div>
                     <h4 className={`text-[17px] font-black mb-1 ${serviceMode === 'self_service' ? 'text-black' : 'text-white'}`}>自助采购</h4>
                     <p className={`text-[12px] font-black uppercase mb-4 ${serviceMode === 'self_service' ? 'text-black/60' : 'text-brand'}`}>¥0 费用</p>
                     <p className={`text-[12px] leading-relaxed mb-6 font-medium ${serviceMode === 'self_service' ? 'text-black/40' : 'text-white/20'}`}>
                       适合专业买家。自行负责判断、沟通、物流和售后风险。
                     </p>
                   </button>

                   <button 
                    type="button"
                    onClick={() => {
                      setServiceMode('platform_standard');
                      setSelectedProvider(null);
                    }}
                    className={`p-6 rounded-[32px] border text-left transition-all relative flex flex-col h-full ${serviceMode === 'platform_standard' ? 'bg-brand border-brand shadow-xl shadow-brand/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                   >
                     <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serviceMode === 'platform_standard' ? 'bg-white text-brand' : 'bg-white/10 text-white/40'}`}>
                          <Sparkles className="w-5 h-5" />
                        </div>
                        {serviceMode === 'platform_standard' && <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-brand" /></div>}
                     </div>
                     <h4 className="text-[17px] font-black mb-1 text-white">平台标准服务</h4>
                     <p className="text-[12px] font-black uppercase mb-4 text-white/60">出厂价 × 20%</p>
                     <p className="text-[12px] text-white/60 leading-relaxed mb-6 font-medium">
                       DXG 官方团队负责核对、厂家对接、订单跟进和异常协调。
                     </p>
                   </button>

                   <button 
                    type="button"
                    onClick={() => setServiceMode('regional_provider')}
                    className={`p-6 rounded-[32px] border text-left transition-all relative flex flex-col h-full ${serviceMode === 'regional_provider' ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                   >
                     <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serviceMode === 'regional_provider' ? 'bg-brand text-white' : 'bg-white/10 text-white/40'}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        {serviceMode === 'regional_provider' && selectedProvider && <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                     </div>
                     <h4 className="text-[17px] font-black mb-1 text-white">本地服务商服务</h4>
                     <p className="text-[12px] font-black uppercase mb-4 text-white/40">20% - 50% 浮动</p>
                     <p className="text-[12px] text-white/20 leading-relaxed mb-6 font-medium">
                       由本地服务商提供深度沟通、交付验收及本地售后跟进。
                     </p>
                   </button>
                </div>
                
                {serviceMode === 'regional_provider' && (
                  <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allProviders.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => setSelectedProvider(p)}
                            className={`p-6 rounded-3xl border transition-all cursor-pointer ${selectedProvider?.id === p.id ? 'bg-white/10 border-brand' : 'bg-white/5 border-white/5'}`}
                          >
                             <div className="flex justify-between mb-4">
                                <div>
                                   <h5 className="font-black text-white">{p.name}</h5>
                                   <div className="flex items-center gap-2 mt-1 text-[11px] text-white/30 font-bold">
                                      <Star className="w-3 h-3 text-brand fill-current" /> {p.rating} · 已服务 {p.completed_order_count} 单
                                   </div>
                                </div>
                                <div className="text-right">
                                   <span className="text-brand font-black italic">+{p.service_rate}%</span>
                                </div>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {p.service_tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-white/5 text-white/20 rounded text-[9px] font-black uppercase tracking-widest">{tag}</span>
                                ))}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Module 3: Logistics & After Sales Protection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Logistics */}
                 <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10 space-y-8">
                    <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                      <Truck className="w-6 h-6 text-brand" /> 03. 物流服务等级
                    </h3>
                    <div className="space-y-4">
                       {[
                         { id: 'economic', label: '经济物流', desc: '到站自提，成本最低', speed: '5-9天' },
                         { id: 'standard', label: '标准物流', desc: '基础派送，性价比均衡', speed: '4-7天' },
                         { id: '安心', label: '安心物流', desc: '优先派送，全节点拍照', speed: '3-5天' },
                         { id: 'brand', label: '品牌物流 (德邦/顺丰)', desc: '品牌直运，保价更全', speed: '2-4天' }
                       ].map(l => (
                         <button 
                          key={l.id}
                          type="button"
                          onClick={() => setLogisticsLevel(l.id as any)}
                          className={`w-full p-6 rounded-3xl border text-left transition-all flex items-center justify-between group ${logisticsLevel === l.id ? 'bg-white/10 border-brand' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                         >
                            <div>
                               <h5 className={`font-black uppercase tracking-widest ${logisticsLevel === l.id ? 'text-brand' : 'text-white'}`}>{l.label}</h5>
                               <p className="text-[12px] text-white/40 font-medium">{l.desc}</p>
                            </div>
                            <div className="text-right">
                               <span className="text-[11px] font-black text-white/30 italic group-hover:text-brand transition-colors">{l.speed}</span>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* After Sales */}
                 <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10 space-y-8">
                    <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-brand" /> 04. 售后保障等级
                    </h3>
                    <div className="space-y-4">
                       {[
                         { id: 'none', label: '无保障', price: '¥0', desc: '自助采购默认，自担风险' },
                         { id: 'basic', label: '基础保障', price: '含', desc: '平台基础质量纠偏' },
                         { id: '安心', label: '安心保障', price: '3%', desc: '极速补件 / 破损即退' },
                         { id: '尊享', label: '尊享保障', price: '8%', desc: '全周期管家协调 / 延误必赔' }
                       ].map(l => (
                         <button 
                          key={l.id}
                          type="button"
                          onClick={() => setAfterSalesLevel(l.id as any)}
                          className={`w-full p-6 rounded-3xl border text-left transition-all flex items-center justify-between group ${afterSalesLevel === l.id ? 'bg-white/10 border-brand' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                         >
                            <div>
                               <h5 className={`font-black uppercase tracking-widest ${afterSalesLevel === l.id ? 'text-brand' : 'text-white'}`}>{l.label}</h5>
                               <p className="text-[12px] text-white/40 font-medium">{l.desc}</p>
                            </div>
                            <div className="text-right">
                               <span className="text-[13px] font-black text-brand italic">{l.price}</span>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Module 4: Optional Premium Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Installation */}
                 <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10 space-y-6">
                    <div className="flex items-center gap-3">
                       <Wrench className="w-6 h-6 text-brand" />
                       <h3 className="text-[20px] font-black text-white">05. 送货与安装</h3>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                       <p className="text-[13px] text-white/40 font-medium leading-relaxed italic">
                         “该项费用取决于您的楼层、是否有电梯及具体安装复杂度。提交需求后由服务方回填报价。暂估 ¥300 - ¥800。”
                       </p>
                    </div>
                 </div>

                 {/* Design */}
                 <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10 space-y-6">
                    <div className="flex items-center gap-3">
                       <PenTool className="w-6 h-6 text-brand" />
                       <h3 className="text-[20px] font-black text-white">06. 专业设计咨询</h3>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsDesignSelected(!isDesignSelected)}
                      className={`w-full p-6 rounded-3xl border text-left transition-all flex items-center justify-between ${isDesignSelected ? 'bg-white/10 border-brand' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                       <div>
                          <h5 className="font-black text-white">方案深度校对</h5>
                          <p className="text-[12px] text-white/40">专业设计师核对尺寸与材质</p>
                       </div>
                       <span className="text-[14px] font-black text-brand italic">¥199 起</span>
                    </button>
                 </div>
              </div>

              {/* Contact Info (Simplified) */}
              <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10 space-y-8">
                <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-brand" /> 07. 联系人与地址
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">联系姓名 *</label>
                    <input 
                      type="text" required value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">手机号 *</label>
                    <input 
                      type="tel" required value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-white text-black rounded-[32px] font-black text-[20px] shadow-2xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? '正在处理...' : '提交方案采购需求'} <ShoppingBag className="w-6 h-6" />
              </button>
            </form>
          </div>

          {/* Sticky Sidebar Summary */}
          <div className="lg:w-[400px] space-y-8">
             <div className="sticky top-40 bg-[#141414] border border-white/5 rounded-[40px] p-8 shadow-2xl">
                <p className="text-[12px] font-black text-white/20 uppercase tracking-widest mb-6">费用汇总 / Budget Summary</p>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/40 font-bold">产品出厂价小计</span>
                      <span className="text-white font-black">¥{pricing.formatCurrency(pricingResult.factoryTotal)}</span>
                   </div>
                   
                   <div className="flex justify-between items-start text-[14px]">
                      <div className="flex flex-col">
                        <span className="text-white/40 font-bold">履约服务费用</span>
                        <span className="text-[10px] text-white/20 font-black uppercase">
                          {serviceMode === 'self_service' ? '自助采购' : 
                           serviceMode === 'platform_standard' ? '平台标准服务' : 
                           `区域服务商: ${selectedProvider?.name || '未选择'}`}
                        </span>
                      </div>
                      <span className="text-white font-black">
                        {pricingResult.platformServiceFee > 0 || pricingResult.regionalServiceFee > 0 ? 
                          `¥${pricing.formatCurrency(pricingResult.platformServiceFee + pricingResult.regionalServiceFee)}` : 
                          '¥0'}
                      </span>
                   </div>

                   <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/40 font-bold">售后保障费用 ({afterSalesLevel})</span>
                      <span className="text-white font-black">¥{pricing.formatCurrency(pricingResult.afterSalesFee)}</span>
                   </div>

                   <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/40 font-bold">物流预估区间</span>
                      <span className="text-white/60 text-[12px] font-bold">
                        ¥{pricing.formatCurrency(pricingResult.logisticsEstimatedMin)} - ¥{pricing.formatCurrency(pricingResult.logisticsEstimatedMax)}
                      </span>
                   </div>

                   <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/40 font-bold">送装/设计服务</span>
                      <span className="text-brand font-black italic">TBD</span>
                   </div>
                </div>

                <div className="h-px bg-white/5 mb-8" />
                
                <div className="flex justify-between items-end mb-10">
                   <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-[13px] font-bold">方案预计总价</span>
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none">Estimate Total</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[36px] font-black text-white italic leading-none tracking-tighter">
                        ¥{pricing.formatCurrency(pricingResult.estimatedTotal)}
                      </p>
                      <p className="text-[11px] text-brand font-black mt-2">产品已按出厂价透明核算</p>
                   </div>
                </div>

                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                   <div className="flex items-start gap-3 text-[12px] font-medium text-white/40 leading-relaxed italic">
                      <ShieldCheck className="w-5 h-5 text-brand shrink-0" />
                      物流与安装费用根据实际体积和楼层另计，价格公开透明。
                   </div>
                   <div className="flex items-start gap-3 text-[12px] font-medium text-white/40 leading-relaxed italic">
                      <Clock className="w-5 h-5 text-brand/40 shrink-0" />
                      厂家备货周期通常为 15-20 天，请提前规划。
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Warning Overlay */}
      {showSelfServiceWarning && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[48px] p-12 max-w-lg w-full text-center space-y-8 shadow-2xl">
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-[28px] font-black text-white mb-4 italic">“自助采购不含任何平台保障”</h3>
              <p className="text-white/50 font-medium leading-relaxed italic">
                您需要自行负责产品核对、厂家对接、物流协调 and 所有售后风险。平台仅提供记录支持。是否继续？
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setShowSelfServiceWarning(false)}
                className="w-full py-5 bg-white text-black rounded-2xl font-black text-[17px] hover:scale-[1.02] transition-all"
              >
                我已了解，继续自助采购
              </button>
              <button 
                onClick={() => {
                  setServiceMode('platform_standard');
                  setShowSelfServiceWarning(false);
                }}
                className="w-full py-5 bg-white/5 border border-white/10 text-white/60 rounded-2xl font-black text-[17px] hover:text-white transition-all"
              >
                返回选择平台服务包
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast 
        message={toastMessage} 
        onClear={() => setToastMessage(null)} 
      />
    </main>
  );
}
