import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, ShoppingBag, ShieldCheck, Truck, ClipboardCheck, Sparkles, 
  MapPin, Phone, User, MessageSquare, Clock, Building2 
} from 'lucide-react';
import { planService } from '../services/planService';
import { orderService } from '../services/orderService';
import { analyticsService } from '../services/analyticsService';
import { pricing } from '../utils/pricing';
import Breadcrumbs from '../components/Breadcrumbs';
import Toast from '../components/Toast';

export default function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      analyticsService.track('view_checkout', { planId });
    }
  }, [planId]);

  const loadData = async () => {
    try {
      const p = await planService.getPlanById(planId!);
      const its = await planService.getPlanItems(planId!);
      setPlan(p);
      setItems(its);
    } finally {
      setLoading(false);
    }
  };

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
      const order = await orderService.createOrderFromPlan(planId!, formData);
      analyticsService.track('submit_lead_order', { orderId: order.id, planId });
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

  const productTotal = items.reduce((sum, i) => {
    const price = i.subtotal || (i.unit_price * i.quantity) || (i.product_snapshot?.price * i.quantity) || 0;
    return sum + price;
  }, 0);

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs 
          isDark={true}
          items={[
            { name: '我的方案', path: '/my-plans' },
            { name: '结算中心' }
          ]} 
        />
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-5 h-5" /> 返回方案详情
        </button>

        <div className="flex flex-col lg:flex-row gap-12 text-left">
          {/* Form */}
          <div className="flex-1 space-y-12">
            <header>
              <h1 className="text-[42px] font-black text-white mb-4">提交方案采购需求</h1>
              <p className="text-[18px] text-white/40">完成后，资深家具顾问将为您核对库存、争取工厂折扣并安排物流。</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10 space-y-8">
                <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                  <User className="w-6 h-6 text-brand" /> 联系人信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">称呼姓名 *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="如何称呼您"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">手机号 *</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="您的手机号码"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 text-left">
                    <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">所在城市 *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">微信号 (可选)</label>
                    <input 
                      type="text" 
                      value={formData.wechat}
                      onChange={e => setFormData({...formData, wechat: e.target.value})}
                      placeholder="便于接收电子合同与效果图"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10 space-y-8">
                <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-brand" /> 项目背景
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">楼盘/社区信息</label>
                    <input 
                      type="text" 
                      value={formData.community}
                      onChange={e => setFormData({...formData, community: e.target.value})}
                      placeholder="例如：万科红郡"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">计划入住时间</label>
                    <select 
                      value={formData.move_in_time}
                      onChange={e => setFormData({...formData, move_in_time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand transition-all appearance-none"
                    >
                      <option>已入住</option>
                      <option>1-3个月内</option>
                      <option>半年内</option>
                      <option>2025年上半年</option>
                      <option>还没想好</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[13px] font-black text-white/20 uppercase tracking-widest pl-1">补充说明 (可选)</label>
                  <textarea 
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="例如：家里有两只猫，需要更耐磨的材质；希望客厅电视柜可以有更多收纳空间..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-brand transition-all h-32 resize-none"
                  />
                </div>
              </div>

              <div className="bg-brand/5 border border-brand/20 rounded-[40px] p-10 space-y-8">
                <h3 className="text-[20px] font-black text-white">您的下一步意向</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'consulting', label: '我还没有完全决定，想先让专业顾问帮我核对一下搭配是否合理', icon: <MessageSquare className="w-5 h-5" /> },
                    { id: 'proposal_confirmed', label: '方案已经定稿，请帮我核对手上这些产品的最新库存和最低折扣', icon: <ClipboardCheck className="w-5 h-5" /> },
                    { id: 'deposit_pending', label: '我很满意这个方案，我想先支付 1000 元定金锁定当前特惠价格', icon: <ShieldCheck className="w-5 h-5" /> }
                  ].map(option => (
                    <label 
                      key={option.id}
                      className={`flex items-center gap-4 p-6 rounded-3xl border transition-all cursor-pointer ${formData.intent === option.id ? 'bg-brand text-white border-brand shadow-xl' : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'}`}
                    >
                      <input 
                        type="radio" 
                        name="intent" 
                        className="hidden"
                        checked={formData.intent === option.id}
                        onChange={() => setFormData({...formData, intent: option.id})}
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.intent === option.id ? 'bg-white/20' : 'bg-white/5'}`}>
                        {option.icon}
                      </div>
                      <span className="font-bold">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-white text-black rounded-[32px] font-black text-[20px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? '正在处理...' : '确认并提交需求'} <ShoppingBag className="w-6 h-6" />
              </button>
            </form>
          </div>

          {/* Sticky Summary */}
          <div className="lg:w-[400px] space-y-8">
             <div className="sticky top-40 bg-[#141414] border border-white/5 rounded-[40px] p-8 shadow-2xl">
                <p className="text-[12px] font-black text-white/20 uppercase tracking-widest mb-6">方案摘要 / Plan Summary</p>
                <div className="space-y-6 mb-8">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                         <Sparkles className="w-8 h-8" />
                      </div>
                      <div>
                         <h4 className="text-[18px] font-black text-white">{plan.name}</h4>
                         <p className="text-[13px] text-white/40 font-bold">{plan.area_range || '90-120㎡'} · {plan.spaces?.join(' / ') || '客厅'}</p>
                      </div>
                   </div>
                   
                   <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-[13px] font-bold">
                           <span className="text-white/60 truncate max-w-[160px]">{item.product_snapshot?.name}</span>
                           <span className="text-white/30 text-[11px] font-mono">x{item.quantity}</span>
                           <span className="text-white">¥{pricing.formatCurrency(item.subtotal || ((item.unit_price || item.price || item.product_snapshot?.price || 0) * (item.quantity || 1)))}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="h-px bg-white/5 mb-8" />
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">产品概算小计</span>
                      <span className="text-white">¥{pricing.formatCurrency(productTotal)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">全案服务费 (5%)</span>
                      <span className="text-white">¥{pricing.formatCurrency(Math.round(productTotal * 0.05))}</span>
                   </div>
                   <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-white/40">物流及安装预估</span>
                      <span className="text-white">¥{pricing.formatCurrency(1500)}</span>
                   </div>
                   <div className="h-px bg-white/5 my-4" />
                   <div className="flex justify-between items-center">
                      <span className="text-white/40 text-[14px] font-bold">方案预估总价</span>
                      <div className="text-right">
                         <p className="text-[24px] font-black text-brand leading-none">¥{pricing.formatCurrency(Math.round(productTotal * 1.05) + 1500)}</p>
                         <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2 px-1">Estimate Price</p>
                      </div>
                   </div>
                </div>

                <div className="mt-10 p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                   <div className="flex items-center gap-3 text-[13px] font-bold text-white/60">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" /> 2年全效联保售后
                   </div>
                   <div className="flex items-center gap-3 text-[13px] font-bold text-white/60">
                      <Truck className="w-5 h-5 text-brand" /> 绝大部分地区顺丰包邮至楼下
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <Toast 
        message={toastMessage} 
        onClear={() => setToastMessage(null)} 
      />
    </main>
  );
}
