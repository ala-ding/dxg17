import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Zap,
  ArrowRight,
  Hexagon,
  Lock,
  Loader2
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
    consulting: {
      name: '咨询会员',
      price: 300,
      period: '月',
      features: [
        '1对1选购建议',
        '清单核对与纠错',
        '多方案比价分析',
        '预算压力实时反馈'
      ]
    },
    professional: {
      name: '专业会员',
      price: 1999,
      period: '年',
      features: [
        '查看专业集采区间',
        '查看阶梯采购规则',
        '参与全屋集采结算优惠',
        '下载产品资料包',
        '申请厂家直接对接',
        '专业采购清单导出'
      ]
    }
  }[planCode as 'consulting' | 'professional'] || {
    name: '咨询会员',
    price: 300,
    period: '月',
    features: []
  };

  const handlePay = async () => {
    try {
      setLoading(true);
      const order = await paymentService.createMembershipOrder(planCode, planInfo.price);
      
      // Simulate network delay
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
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-12 transition-colors mr-auto"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[14px] font-black uppercase tracking-widest">返回会员中心</span>
        </button>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          {/* Order Summary */}
          <div className="md:col-span-3 space-y-8 text-left">
            <div>
              <h1 className="text-[40px] font-black text-white mb-4 tracking-tight">开通{planInfo.name}</h1>
              <p className="text-white/40 text-[16px] font-medium leading-relaxed">
                解锁深度采购能力，让每一件家具都买在底线价。
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
              <h3 className="text-[14px] font-black text-brand tracking-widest uppercase mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 核心权益摘要
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {planInfo.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-white/70 text-[14px] font-bold line-clamp-1">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex gap-4">
              <Zap className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="text-left">
                <p className="text-amber-500 text-[14px] font-black mb-1">即刻生效</p>
                <p className="text-amber-500/60 text-[13px] font-medium leading-relaxed">
                  支付成功后，您的账号将立即升级为{planInfo.name}，有效期自今日起计算。
                </p>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[40px]" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-white/30 text-[12px] font-black uppercase tracking-widest">结算总额</span>
                  <Hexagon className="w-6 h-6 text-brand" />
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[14px] font-black text-white/40 text-left">RMB</span>
                  <span className="text-[56px] font-black text-white leading-none tracking-tight">
                    {planInfo.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-white/20 text-[13px] font-bold uppercase tracking-widest mb-10">
                  / {planInfo.period === '年' ? '365天有效期' : '30天有效期'}
                </p>

                <div className="space-y-4 mb-10">
                  <p className="text-white/30 text-[11px] font-black uppercase tracking-widest pl-1">支付方式</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 h-12 bg-white/5 border border-white/10 rounded-xl text-white/40 text-[13px] font-black hover:bg-white hover:text-black hover:border-white transition-all cursor-not-allowed grayscale">
                      <CreditCard className="w-4 h-4" /> 微信支付
                    </button>
                    <button className="flex items-center justify-center gap-2 h-12 bg-white/5 border border-white/10 rounded-xl text-white/40 text-[13px] font-black hover:bg-white hover:text-black hover:border-white transition-all cursor-not-allowed grayscale">
                      <CreditCard className="w-4 h-4" /> 支付宝
                    </button>
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={handlePay}
                  className="w-full py-5 bg-brand text-white rounded-2xl font-black text-[16px] shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>正在处理支付...</span>
                    </>
                  ) : (
                    <>
                      <span>模拟支付结算</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <p className="text-white/20 text-[11px] font-medium text-center mt-6 px-4">
                  点击按钮即代表您同意《底线哥会员服务协议》与《隐私政策》
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-4 px-6 bg-white/2 border border-white/5 rounded-2xl">
              <Lock className="w-4 h-4 text-white/20" />
              <span className="text-[12px] font-bold text-white/20 tracking-wide uppercase">SSL Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}
