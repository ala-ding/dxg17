import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, ShieldCheck, CheckCircle2, CreditCard, 
  Zap, ArrowRight, Hexagon, Lock, Loader2
} from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { membershipService } from '../services/membershipService';
import Toast from '../components/Toast';

export default function MembershipCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planCode = searchParams.get('plan') || 'consulting';
  
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const planInfo = {
    consulting: { name: '咨询会员', price: 300, period: '月', features: ['1对1选购建议', '清单核对与纠错', '多方案比价分析', '预算压力实时反馈'] },
    professional: { name: '专业会员', price: 1999, period: '年', features: ['查看专业集采区间', '查看阶梯采购规则', '参与全屋集采结算', '下载产品资料包', '申请厂家对接', '专业采购清单导出'] }
  }[planCode as 'consulting' | 'professional'] || { name: '咨询会员', price: 300, period: '月', features: [] };

  const handlePay = async () => {
    try {
      setLoading(true);
      const order = await paymentService.createMembershipOrder(planCode, planInfo.price);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await paymentService.mockPayMembershipOrder(order.id);
      await membershipService.activateMembership(planCode);
      navigate(`/membership/success?plan=${planCode}`);
    } catch (e: any) {
      setToastMessage(`支付失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-40 overflow-x-hidden text-left">
      <div className="max-w-[1200px] mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/30 hover:text-white mb-8 md:mb-12 transition-all font-black uppercase text-[12px] tracking-widest"><ChevronLeft className="w-4 h-4" /> 返回</button>

        <div className="flex flex-col lg:flex-row gap-10 md:gap-16">
          <div className="flex-1 space-y-8 md:space-y-12">
            <div>
              <h1 className="text-[32px] md:text-[40px] font-black text-white mb-4 tracking-tight">开通{planInfo.name}</h1>
              <p className="text-[15px] md:text-[18px] text-white/40 font-medium leading-relaxed italic">解锁深度采购能力，让每一件家具都买在厂家底线价。</p>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[40px] p-8 md:p-10 space-y-8">
              <h3 className="text-[13px] md:text-[14px] font-black text-brand tracking-[0.2em] uppercase flex items-center gap-3"><ShieldCheck className="w-5 h-5" /> 权益概览</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {planInfo.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" /><span className="text-white/70 text-[14px] font-bold">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex gap-4">
              <Zap className="w-6 h-6 text-amber-500 shrink-0" />
              <div><p className="text-amber-500 text-[14px] font-black mb-1">支付即同步生效</p><p className="text-amber-500/40 text-[13px] font-medium leading-relaxed">由于是虚拟服务，支付成功后系统将自动为您升级权益，不支持退换。</p></div>
            </div>
          </div>

          <div className="lg:w-[420px] shrink-0">
            <div className="bg-[#141414] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px] pointer-events-none" />
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-10"><span className="text-white/20 text-[11px] font-black uppercase tracking-widest">结算金额预览</span><Hexagon className="w-6 h-6 text-brand" /></div>
                 <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-[14px] font-black text-white/20 italic">RMB</span>
                   <span className="text-[48px] md:text-[64px] font-black text-white leading-none tracking-tighter italic">{planInfo.price.toLocaleString()}</span>
                 </div>
                 <p className="text-white/20 text-[12px] font-black uppercase tracking-widest mb-12">/ {planInfo.period === '年' ? '365' : '30'} DAYS VALIDITY</p>

                 <div className="space-y-4 mb-12">
                   <p className="text-white/20 text-[10px] font-black uppercase tracking-widest pl-1">模拟支付通道</p>
                   <div className="grid grid-cols-1 gap-3">
                     <button className="flex items-center justify-center gap-3 h-14 bg-white/5 border border-white/5 rounded-2xl text-white/40 text-[14px] font-black cursor-not-allowed grayscale"><CreditCard className="w-5 h-5" /> 微信支付 (模拟)</button>
                   </div>
                 </div>

                 <button disabled={loading} onClick={handlePay} className="w-full py-6 bg-brand text-white rounded-[28px] font-black text-[18px] shadow-2xl shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                   {loading ? <><Loader2 className="w-6 h-6 animate-spin" /><span>处理中...</span></> : <><span>模拟支付即刻开通</span><ArrowRight className="w-5 h-5" /></>}
                 </button>
                 <p className="text-white/10 text-[11px] font-medium text-center mt-6 px-4">支付即视为同意会员服务协议相关条款</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </main>
  );
}
